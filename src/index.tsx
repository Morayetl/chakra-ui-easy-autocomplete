import React, { useState, useEffect, useRef } from 'react'
import { Input, ChakraProvider, InputProps, Flex, FlexProps, SimpleGrid, Box, BoxProps, InputGroup, InputLeftElement, InputRightElement, InputLeftAddon, InputRightAddon } from '@chakra-ui/react'
import mergeRefs from "react-merge-refs";
//import styles from './styles.module.css'

export type ChakraUIEasyAutoCompleteSuggestionItemProps = {
  /**
   * label for suggestion
   */
  label: string;

  /**
   * Value for suggestion
   */
  value: any;

  /**
   * Optional key
   */
  key?: string;
};

export type ChakraUIEasyAutoCompleteProps = {
  /**
   * Suggestions
   */
  suggestions: Array<ChakraUIEasyAutoCompleteSuggestionItemProps> | undefined;

  /**
   * Properties to pass for items
   */
  itemProps?: (isActive: boolean) => BoxProps;

  /**
   * Custom item element
   */
  item?: (
    props: {
      onMouseLeave: () => void;
      onMouseEnter: () => void;
      onClick: () => void;
      onDragLeave: (e:any) => void;
      onBlur:() => void;
    },
    data: ChakraUIEasyAutoCompleteSuggestionItemProps,
    isActive: boolean,
    index: number
  ) => JSX.Element

  /**
   * For styling the suggestion
   */
  suggestionBoxProps?: FlexProps;

  /**
   * Result not found container properties
   */
  resultNotFoundProps?: BoxProps;

  /**
   * Result not found element
   */
  resultNotFoundElement?: JSX.Element;

  /**
   * Input left element
   */
  inputLeftElement?: JSX.Element;

  /**
   * Input right element
   */
  inputRightElement?: JSX.Element;

  /**
   * Input left addon
   */
  inputLeftAddon?: JSX.Element;

  /**
   * Input right addon
   */
  inputRightAddon?: JSX.Element;

  onSelect: (data:ChakraUIEasyAutoCompleteSuggestionItemProps) => void
} & InputProps & FlexProps;

export const ChakraUIEasyAutoComplete = React.forwardRef<HTMLElement, ChakraUIEasyAutoCompleteProps>((props, ref) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<ChakraUIEasyAutoCompleteSuggestionItemProps>>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [input, setInput] = React.useState("");
  const [itemFocused, setItemFocused] = useState(false);
  const inputRef = useRef<HTMLElement>();

  /**
   * Sets all the suggestions when input is empty
   */
  useEffect(() => {
    if (filteredSuggestions.length === 0 && !input) {
      setFilteredSuggestions(props.suggestions || [])
    }
  }, [props.suggestions]);

  const getInputProps = () => {
    const inputProps = Object.assign({}, props);

    delete inputProps['item'];
    delete inputProps['suggestionBoxProps'];
    delete inputProps['itemProps'];
    delete inputProps['resultNotFoundProps'];
    delete inputProps['resultNotFoundElement'];
    delete inputProps['inputLeftElement'];
    delete inputProps['inputRightElement'];
    delete inputProps['inputLeftAddon'];
    delete inputProps['inputRightAddon'];

    return inputProps;
  }

  const createSyntheticEvent = <T extends Element, E extends Event>(event: E): React.SyntheticEvent<T, E> => {
    let isDefaultPrevented = false;
    let isPropagationStopped = false;
    const preventDefault = () => {
      isDefaultPrevented = true;
      event.preventDefault();
    }
    const stopPropagation = () => {
      isPropagationStopped = true;
      event.stopPropagation();
    }
    return {
      nativeEvent: event,
      currentTarget: event.currentTarget as EventTarget & T,
      target: event.target as EventTarget & T,
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      defaultPrevented: event.defaultPrevented,
      eventPhase: event.eventPhase,
      isTrusted: event.isTrusted,
      preventDefault,
      isDefaultPrevented: () => isDefaultPrevented,
      stopPropagation,
      isPropagationStopped: () => isPropagationStopped,
      persist: () => { },
      timeStamp: event.timeStamp,
      type: event.type,
    };
  }

  const createEvent = (value: any) => {
    const target = document.createElement('input');
    target.value = value;
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', { writable: false, value: target })
    const syntheticEvent = createSyntheticEvent(event) as React.ChangeEvent<typeof target>;
    return syntheticEvent;
  }
  const onChange = (e: any) => {
    const userInput = e.target.value;

    // Filter our suggestions that don't contain the user's input
    const unLinked = props.suggestions ? props.suggestions.filter(
      (suggestion) =>
        suggestion.label.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    ) : [];

    setInput(e.target.value);
    setFilteredSuggestions(unLinked);
    setActiveSuggestionIndex(0);
    setShowSuggestions(true);
    e.stopPropagation();

    if (props.onChange) {
      const event = createEvent(userInput);
      props.onChange(event)
    }
  };

  const onItemClick = (index: number) => {
    setFilteredSuggestions([filteredSuggestions[index]]);
    setInput(filteredSuggestions[index].label);
    setActiveSuggestionIndex(0);
    setShowSuggestions(false);
    setItemFocused(false);

    if (props.onSelect) {
      props.onSelect(filteredSuggestions[index])
    }
  };

  const onClick = () => {
    setShowSuggestions(true);
  }

  const onKeyDown = (e: any) => {
    const keyCode: string = e.key;
    const up = 'ArrowUp';
    const down = 'ArrowDown';
    const enter = 'Enter';
    const escape = 'Escape';

    if(filteredSuggestions.length === 0){
      return;
    }

    if (keyCode === escape) {
      setShowSuggestions(false);
    }

    if (keyCode === enter && !input) {
      setShowSuggestions(true);
    }

    if (keyCode === down && activeSuggestionIndex >= -1) {
      const index = activeSuggestionIndex + 1;
      if (index < filteredSuggestions.length) {
        setActiveSuggestionIndex(index);
      }
    }

    if (keyCode === up) {
      const index = activeSuggestionIndex - 1;
      if (index >= 0) {
        setActiveSuggestionIndex(index);
      }
    }

    if (keyCode === enter && showSuggestions && activeSuggestionIndex > -1) {
      onItemClick(activeSuggestionIndex);
    }
  }

  const onBlur = (e: any) => {
    if (!itemFocused) {
      setShowSuggestions(false);
    }

    if (props.onBlur) {
      props.onBlur(e);
    }
  }

  const onDragLeave = (e: any) => {
    setShowSuggestions(false);
    e.preventDefault();
    e.stopPropagation();

    if (props.onDragLeave) {
      props.onDragLeave(e);
    }
  }

  const focusInput = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }

  const onItemMouseEnter = () => {
    setItemFocused(true);
  }

  const onItemMouseLeave = () => {
    setItemFocused(false);
    if (showSuggestions) {
      focusInput();
    }
  }

  const SuggestionsListComponent = () => {
    const boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"
    return filteredSuggestions.length ? (
      <Flex w="inherit" background="transparent" position="absolute" >
        <SimpleGrid w="100%" background="white" columns={1} mt={1} overflow="hidden" borderRadius="2px" zIndex={3} boxShadow={boxShadow} {...props.suggestionBoxProps}>
          {filteredSuggestions.map((suggestion, index) => {
            const isActive = index === activeSuggestionIndex;
            const eventProps = {
              onMouseLeave: onItemMouseLeave,
              onMouseEnter: onItemMouseEnter,
              onClick: () => onItemClick(index),
              onDragLeave: onDragLeave,
              onBlur: focusInput
            }

            const boxProps = props.itemProps ? props.itemProps(isActive) : {};

            return !props.item ? (
              <Box
                boxSize="100%"
                p={2}
                _hover={{ background: "blue.400", color: "black" }}
                bg={isActive ? 'blue.300' : 'transparent'}
                userSelect="none"
                {...boxProps}
                {...eventProps}
                tabIndex={0}
                key={index}

              >
                {suggestion.label}
              </Box>
            ) : props.item(eventProps, suggestion, isActive, index);
          })}
        </SimpleGrid>
      </Flex>
    ) : props.resultNotFoundElement ? (
      <Flex mt={1} w="inherit" background="white" position="absolute" boxShadow={boxShadow} zIndex={3} {...props.resultNotFoundProps}>
        {props.resultNotFoundElement}
      </Flex>
    ) : null;
  };

  return (
    <ChakraProvider>
      <Box>
        <InputGroup {...getInputProps()}>
          {
            props.inputLeftElement && !props.inputLeftAddon && (
              <InputLeftElement
                children={props.inputLeftElement}
              />
            )
          }

          {
            props.inputLeftAddon && !props.inputLeftElement && (
              <InputLeftAddon
                children={props.inputLeftAddon}
              />
            )
          }

          <Input
            {...getInputProps()}
            type="text"
            onKeyDown={onKeyDown}
            value={input}
            onBlur={onBlur}
            onChange={onChange}
            onSelect={(e:any) => e.stopPropagation()}
            onClick={onClick}
            ref={mergeRefs([ref, inputRef])}
          />

          {
            props.inputRightElement && !props.inputRightAddon && (
              <InputRightElement
                children={props.inputRightElement}
              />
            )
          }

          {
            props.inputRightAddon && !props.inputRightElement && (
              <InputRightAddon
                children={props.inputRightAddon}
              />
            )
          }
        </InputGroup>
      </Box>
      <Flex {...getInputProps()} >
        {showSuggestions && <SuggestionsListComponent />}
      </Flex>
    </ChakraProvider>
  );
});
