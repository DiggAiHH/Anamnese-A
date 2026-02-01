// Minimal Web-Mock für react-native-screens
type ReactNode = unknown;

export const enableScreens = (_enable?: boolean): void => {};
export const enableFreeze = (_enable?: boolean): void => {};
export const screensEnabled = (): boolean => false;

export const Screen = ({ children }: { children: ReactNode }): ReactNode => children;
export const ScreenContainer = ({ children }: { children: ReactNode }): ReactNode => children;

export default {
	enableScreens,
	enableFreeze,
	screensEnabled,
	Screen,
	ScreenContainer,
};
