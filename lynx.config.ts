import { defineConfig } from '@lynx-js/rspeedy';

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

export default defineConfig({
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  environments: {
    web: {},
    lynx: {},
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx(),
    ...(process.env.NODE_ENV === 'development' ? [pluginTypeCheck()] : []),
  ],
});
