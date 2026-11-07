// SPIKE ONLY: the asset imports Vite serves to the spike's stories.
declare module '*.jpg' {
  const url: string;
  export default url;
}
declare module '*?url' {
  const url: string;
  export default url;
}
