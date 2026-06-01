import 'axios';

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface AxiosRequestConfig<D = any> {
    showType?: number;
  }
}
