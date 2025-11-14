const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const path = require('path')
const fs = require('fs')

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'anniecong.o-r.kr', 'www.anniecong.o-r.kr'],
  },
  build: {
    outDir: 'build',
    // public 폴더의 파일들이 빌드 출력에 포함되도록 보장
    copyPublicDir: true,
    // 빌드 최적화 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 콘솔 로그 유지 (디버깅용)
      },
    },
    // 청크 크기 경고 임계값 증가 (JSPrintManager.js 파일이 클 수 있음)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // JSPrintManager.js를 별도 청크로 분리하지 않음 (public 폴더에서 직접 제공)
        manualChunks: undefined,
      },
    },
  },
  // public 폴더 경로 명시 (기본값이지만 명시적으로 설정)
  publicDir: 'public',
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  define: {
    'process.env': 'import.meta.env'
  }
})