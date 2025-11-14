/// <reference types="@react-three/fiber" />

declare module '@react-three/fiber' {
  export * from '@react-three/fiber/dist/declarations/src';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

