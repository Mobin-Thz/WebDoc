import * as migration_20260912_193828_init from './20260912_193828_init';

export const migrations = [
  {
    up: migration_20260912_193828_init.up,
    down: migration_20260912_193828_init.down,
    name: '20260912_193828_init'
  },
];
