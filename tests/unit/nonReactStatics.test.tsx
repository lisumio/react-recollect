/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { collect, WithStoreProp } from '../../src';

describe('should copy static methods to the collected component', () => {
  it('for a class component', () => {
    class ClassWithStaticRaw extends React.Component<WithStoreProp> {
      static returnCats() {
        return 'cats';
      }

      static returnDogs: () => string;

      render() {
        return <h1>Hi</h1>;
      }
    }

    ClassWithStaticRaw.returnDogs = () => 'dogs';

    const ClassWithStatic = collect(ClassWithStaticRaw);

    expect(ClassWithStatic.returnCats()).toBe('cats');
    expect(ClassWithStatic.returnDogs()).toBe('dogs');
  });

  it('for a function component', () => {
    const ClassWithStaticRaw = () => <h1>Hi</h1>;

    ClassWithStaticRaw.returnDogs = () => 'dogs';

    const ClassWithStatic = collect(ClassWithStaticRaw);

    expect(ClassWithStatic.returnDogs()).toBe('dogs');
  });
});