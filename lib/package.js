Package.describe({
  summary: "Simple system for groups"
});

Package.on_use(function (api) {
  api.add_files('common.js', ['server', 'client']);
});
