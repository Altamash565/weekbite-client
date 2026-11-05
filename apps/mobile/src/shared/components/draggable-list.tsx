import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Insets,
  Keyboard,
  LayoutChangeEvent,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Physics spring configuration for responsive, fluid 60/120fps motion
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 220,
  mass: 0.5,
};

// Context for coordinating outer ScrollView locking during active drag
interface DraggableScrollContextValue {
  setScrollEnabled: (enabled: boolean) => void;
}

const DraggableScrollContext = createContext<DraggableScrollContextValue>({
  setScrollEnabled: () => {},
});

type PanGestureType = ReturnType<typeof Gesture.Pan>;

// Context for providing stable PanGesture to DragHandle
const RowGestureContext = createContext<PanGestureType | null>(null);

/**
 * Clean drop-in replacement for NestableScrollContainer.
 * Uses standard React Native ScrollView and locks scrolling while any item is being dragged.
 */
export const NestableScrollContainer: React.FC<ScrollViewProps> = ({
  children,
  scrollEnabled = true,
  ...rest
}) => {
  const [internalScrollEnabled, setInternalScrollEnabled] = useState(true);

  return (
    <DraggableScrollContext.Provider
      value={{
        setScrollEnabled: setInternalScrollEnabled,
      }}
    >
      <ScrollView
        scrollEnabled={scrollEnabled && internalScrollEnabled}
        {...rest}
      >
        {children}
      </ScrollView>
    </DraggableScrollContext.Provider>
  );
};

export interface RenderItemParams<T> {
  item: T;
  drag: () => void;
  isActive: boolean;
  getIndex: () => number | undefined;
  DragHandle: React.FC<{
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    hitSlop?: Insets;
  }>;
}

/**
 * Top-level stable DragHandle component.
 * Attaches the row's PanGesture without re-mounting mid-drag.
 */
export const DragHandle: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hitSlop?: Insets;
}> = ({ children, style, hitSlop }) => {
  const panGesture = useContext(RowGestureContext);

  if (!panGesture) {
    return (
      <View style={style} hitSlop={hitSlop}>
        {children}
      </View>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style} hitSlop={hitSlop} collapsable={false}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

/**
 * ScaleDecorator wraps row contents for active visual emphasis.
 */
export const ScaleDecorator: React.FC<{
  activeScale?: number;
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};

export interface DraggableListProps<T> {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onDragEnd: (params: { data: T[] }) => void;
  onDragBegin?: () => void;
  scrollEnabled?: boolean;
}

interface DraggableRowProps<T> {
  item: T;
  index: number;
  keyStr: string;
  count: number;
  activeKey: SharedValue<string>;
  activeIndex: SharedValue<number>;
  hoverIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  rowHeight: SharedValue<number>;
  activeId: string;
  onStartDrag: (key: string, index: number) => void;
  onEndDrag: (from: number, to: number) => void;
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  onLayoutHeight: (key: string, height: number) => void;
}

function DraggableRow<T>({
  item,
  index,
  keyStr,
  count,
  activeKey,
  activeIndex,
  hoverIndex,
  dragY,
  rowHeight,
  activeId,
  onStartDrag,
  onEndDrag,
  renderItem,
  onLayoutHeight,
}: DraggableRowProps<T>) {
  const isDropping = useSharedValue(false);

  // Pan gesture activates only on intentional vertical drag (>= 6px)
  // Taps and micro-movements are cleanly ignored
  const panGesture = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .failOffsetX([-20, 20])
    .onStart(() => {
      isDropping.value = false;
      activeKey.value = keyStr;
      activeIndex.value = index;
      hoverIndex.value = index;
      dragY.value = 0;
      runOnJS(onStartDrag)(keyStr, index);
    })
    .onUpdate((e) => {
      dragY.value = e.translationY;
      const h = rowHeight.value > 0 ? rowHeight.value : 52;
      const deltaSlots = Math.round(e.translationY / h);
      const target = Math.max(0, Math.min(count - 1, index + deltaSlots));
      hoverIndex.value = target;
    })
    .onEnd(() => {
      isDropping.value = true;
      const from = activeIndex.value;
      const to = hoverIndex.value;
      const h = rowHeight.value > 0 ? rowHeight.value : 52;
      const finalOffset = (to - from) * h;

      dragY.value = withSpring(finalOffset, SPRING_CONFIG, () => {
        activeKey.value = '';
        activeIndex.value = -1;
        hoverIndex.value = -1;
        dragY.value = 0;
        runOnJS(onEndDrag)(from, to);
      });
    })
    .onFinalize(() => {
      if (!isDropping.value && activeKey.value === keyStr) {
        activeKey.value = '';
        activeIndex.value = -1;
        hoverIndex.value = -1;
        dragY.value = 0;
        runOnJS(onEndDrag)(index, index);
      }
    });

  const rowAnimStyle = useAnimatedStyle(() => {
    const isDraggingAny = activeKey.value !== '';
    const isSelf = activeKey.value === keyStr;
    const h = rowHeight.value > 0 ? rowHeight.value : 52;

    if (!isDraggingAny) {
      return {
        transform: [
          { translateY: withSpring(0, SPRING_CONFIG) },
          { scale: withSpring(1, SPRING_CONFIG) },
        ],
        zIndex: 1,
        elevation: 0,
      };
    }

    if (isSelf) {
      return {
        transform: [
          { translateY: dragY.value },
          { scale: withSpring(1.04, SPRING_CONFIG) },
        ],
        zIndex: 999,
        elevation: 12,
      };
    }

    const from = activeIndex.value;
    const hover = hoverIndex.value;
    let shift = 0;

    if (from < hover) {
      if (index > from && index <= hover) {
        shift = -h;
      }
    } else if (from > hover) {
      if (index >= hover && index < from) {
        shift = h;
      }
    }

    return {
      transform: [
        { translateY: withSpring(shift, SPRING_CONFIG) },
        { scale: withSpring(1, SPRING_CONFIG) },
      ],
      zIndex: 1,
      elevation: 0,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) {
      onLayoutHeight(keyStr, h);
    }
  };

  const dummyDrag = useCallback(() => {}, []);
  const getIndex = useCallback(() => index, [index]);
  const isActive = activeId === keyStr;

  return (
    <Animated.View
      style={[styles.rowWrapper, rowAnimStyle]}
      onLayout={handleLayout}
      collapsable={false}
    >
      <RowGestureContext.Provider value={panGesture}>
        {renderItem({
          item,
          drag: dummyDrag,
          isActive,
          getIndex,
          DragHandle,
        })}
      </RowGestureContext.Provider>
    </Animated.View>
  );
}

export function DraggableList<T>({
  data,
  renderItem,
  keyExtractor,
  onDragEnd,
  onDragBegin,
}: DraggableListProps<T>) {
  const { setScrollEnabled } = useContext(DraggableScrollContext);
  const [activeId, setActiveId] = useState<string>('');

  const activeKey = useSharedValue<string>('');
  const activeIndex = useSharedValue<number>(-1);
  const hoverIndex = useSharedValue<number>(-1);
  const dragY = useSharedValue<number>(0);
  const rowHeight = useSharedValue<number>(52);

  const measuredHeights = useRef<{ [key: string]: number }>({});

  const handleLayoutHeight = useCallback(
    (key: string, height: number) => {
      measuredHeights.current[key] = height;
      const values = Object.values(measuredHeights.current);
      if (values.length > 0) {
        const avg = values.reduce((sum, h) => sum + h, 0) / values.length;
        rowHeight.value = avg;
      }
    },
    [rowHeight]
  );

  const handleStartDrag = useCallback(
    (key: string) => {
      Keyboard.dismiss();
      setActiveId(key);
      setScrollEnabled(false);
      onDragBegin?.();
    },
    [onDragBegin, setScrollEnabled]
  );

  const handleEndDrag = useCallback(
    (from: number, to: number) => {
      setActiveId('');
      setScrollEnabled(true);
      if (from !== to && from >= 0 && to >= 0 && from < data.length && to < data.length) {
        const nextData = [...data];
        const [movedItem] = nextData.splice(from, 1);
        nextData.splice(to, 0, movedItem);
        onDragEnd({ data: nextData });
      }
    },
    [data, onDragEnd, setScrollEnabled]
  );

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const keyStr = keyExtractor(item, index);
        return (
          <DraggableRow
            key={keyStr}
            item={item}
            index={index}
            keyStr={keyStr}
            count={data.length}
            activeKey={activeKey}
            activeIndex={activeIndex}
            hoverIndex={hoverIndex}
            dragY={dragY}
            rowHeight={rowHeight}
            activeId={activeId}
            onStartDrag={handleStartDrag}
            onEndDrag={handleEndDrag}
            renderItem={renderItem}
            onLayoutHeight={handleLayoutHeight}
          />
        );
      })}
    </View>
  );
}

export const NestableDraggableFlatList = DraggableList;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  rowWrapper: {
    width: '100%',
  },
});
