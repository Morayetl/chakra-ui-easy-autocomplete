import React from 'react';
import renderer from 'react-test-renderer';
import { ChakraUIEasyAutoComplete, ChakraUIEasyAutoCompleteSuggestionItemProps } from '.'
import { Text } from '@chakra-ui/react';

const suggestions: Array<ChakraUIEasyAutoCompleteSuggestionItemProps> = [
  {
    label: 'cow',
    value: 'moow'
  },
  {
    label: 'chicken',
    value: 'kotkot'
  },
  {
    label: 'pig',
    value: 'röff röff'
  }
]

describe('Renders', () => {
  it('correctly', () => {
    const component = renderer.create(
      <ChakraUIEasyAutoComplete
        size="sm"
        w="200px"
        suggestions={suggestions}
        onChange={(e: any) => console.log(e.target.value)}
        resultNotFoundElement={<Text p={3}>Result not found</Text>}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  })
})
