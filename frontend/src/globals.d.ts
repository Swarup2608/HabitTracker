// CSS modules
declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Global CSS imports
declare module "*.css" {
  const content: string;
  export default content;
}