// The target site publishes 425 docs pages. Keep one generated, ordered map of
// every page so the sidebar and previous/next controls do not silently omit a
// route when content is added upstream.
export { generatedNavigation as navigation, generatedNavItems as navItems } from './generated-navigation.js';
