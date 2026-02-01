// Web-Mock für react-native-safe-area-context
// Ziel: react-navigation (Header/SafeAreaProviderCompat) soll auf Web builden.

import * as React from 'react';

type ReactNode = React.ReactNode;

export type Insets = { top: number; right: number; bottom: number; left: number };
export type Frame = { x: number; y: number; width: number; height: number };

const DEFAULT_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_FRAME: Frame = { x: 0, y: 0, width: 0, height: 0 };

export const SafeAreaInsetsContext = React.createContext<Insets | null>(null);
export const SafeAreaFrameContext = React.createContext<Frame | null>(null);

export const SafeAreaProvider = ({ children }: { children: ReactNode }): React.ReactElement =>
  React.createElement(
    SafeAreaFrameContext.Provider,
    { value: DEFAULT_FRAME },
    React.createElement(SafeAreaInsetsContext.Provider, { value: DEFAULT_INSETS }, children),
  );

export const SafeAreaView = ({ children }: { children: ReactNode }): ReactNode => children;

export const useSafeAreaInsets = (): Insets =>
  React.useContext(SafeAreaInsetsContext) ?? DEFAULT_INSETS;
export const useSafeAreaFrame = (): Frame =>
  React.useContext(SafeAreaFrameContext) ?? DEFAULT_FRAME;

export const initialWindowMetrics = null;

export default {};
