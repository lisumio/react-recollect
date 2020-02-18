import React from 'react';
import { render } from '@testing-library/react';
import { collect, store as globalStore } from '../../src';

globalStore.count = 1;
let parentCompRenderCount = 0;
let comp1RenderCount = 0;
let comp2RenderCount = 0;

const Comp1 = collect(({store}) => {
  comp1RenderCount++;

  return (
    <h1>Comp1 count: {store.count}</h1>
  );
});

const Comp2 = collect(({store}) => {
  comp2RenderCount++;

  return (
    <h1>Comp2 count: {store.count}</h1>
  );
});

const ParentComponent = () => {
  parentCompRenderCount++;
  return (
    <div>
      <Comp1/>
      <Comp2/>
    </div>
  );
};

it('should batch synchronous updates to the store', () => {
  const { getByText } = render(<ParentComponent />);

  expect(parentCompRenderCount).toBe(1);
  expect(comp1RenderCount).toBe(1);
  expect(comp2RenderCount).toBe(1);
  expect(getByText(/Comp1 count:/)).toHaveTextContent('Comp1 count: 1');
  expect(getByText(/Comp2 count:/)).toHaveTextContent('Comp2 count: 1');

  globalStore.count++;

  expect(parentCompRenderCount).toBe(1); // shouldn't re-render
  expect(comp1RenderCount).toBe(2);
  expect(comp2RenderCount).toBe(2);
  expect(getByText(/Comp1 count:/)).toHaveTextContent('Comp1 count: 2');
  expect(getByText(/Comp2 count:/)).toHaveTextContent('Comp2 count: 2');

  globalStore.count++;
  globalStore.count++;

  expect(parentCompRenderCount).toBe(1);
  // TODO (davidg): make the below 3!
  expect(comp1RenderCount).toBe(4);
  expect(comp2RenderCount).toBe(4);
  expect(getByText(/Comp1 count:/)).toHaveTextContent('Comp1 count: 4');
  expect(getByText(/Comp2 count:/)).toHaveTextContent('Comp2 count: 4');
});
