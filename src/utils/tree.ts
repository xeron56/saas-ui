export interface Tree<T> {
  children?: Tree<T>[];
}

export async function accessTree<T>(tree: Tree<T>[], fn: (t: Tree<T>) => Promise<boolean>) {
  const passed: Tree<T>[] = [];
  for (const t of tree) {
    const ok = await fn(t);
    if (!ok) {
      continue;
    }
    if (t.children) {
      const children = await accessTree(t.children, fn);
      t.children = children.length ? children : undefined;
    }
    passed.push(t);
  }
  return passed;
}
