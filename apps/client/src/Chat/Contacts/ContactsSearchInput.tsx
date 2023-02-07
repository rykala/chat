import { Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { BiSearchAlt as SearchIcon } from "react-icons/bi";

type SearchContactsProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onFocus: () => void;
  onBlur: () => void;
};

export const ContactsSearchInput = ({ onFocus, value, onChange, onBlur }: SearchContactsProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isFocused) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as HTMLElement)) {
        setIsFocused(false);
        onBlur();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isFocused]);

  return (
    <InputGroup>
      {!isFocused && <InputLeftElement pointerEvents="none" children={<Icon as={SearchIcon} color="gray.400" />} />}
      <Input
        ref={inputRef}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onFocus={() => {
          onFocus();
          setIsFocused(true);
        }}
        onChange={onChange}
        placeholder="Find user"
        pl={isFocused ? 4 : 8}
        variant={"filled"}
      />
    </InputGroup>
  );
};
