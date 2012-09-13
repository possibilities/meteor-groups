Package.describe({
  summary: "Simple system for groups"
});

Package.on_use(function(api) {
  api.use('accounts-base', ['server', 'client']);
  api.use('accounts-password', ['server', 'client']);
  api.add_files('common.js', ['server', 'client']);
});

Package.on_test(function (api) {
  api.use('test-helpers', ['client', 'server']);
  api.add_files('tests/server.js', 'server');
  api.add_files('tests/client.js', 'client');
});
