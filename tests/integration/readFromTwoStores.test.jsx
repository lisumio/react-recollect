import React from 'react';
import { store as globalStore } from 'src';
import { collectAndRender, expectToThrow } from 'tests/testUtils';

it('should throw an error if I read from the wrong store', () => {
  globalStore.meta = { title: 'Hello' };

  expectToThrow(() => {
    collectAndRender(({ store }) => (
      <div>
        <p>{`${store.meta.title} from the store`}</p>
        <p>{`${globalStore.meta.title} from the globalStore`}</p>
      </div>
    ));
  });
});