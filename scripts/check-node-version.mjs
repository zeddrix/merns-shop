const major = process.env.NODE_TEST_MAJOR
  ? Number(process.env.NODE_TEST_MAJOR)
  : Number(process.versions.node.split('.')[0]);

if (major < 22) {
  console.error(
    `merns-shop requires Node.js 22 or later (current: ${process.versions.node}). Run: nvm use`
  );
  process.exit(1);
}
