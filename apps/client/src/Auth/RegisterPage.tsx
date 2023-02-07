import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  Link,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import LottiePlayer from "lottie-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import { mergeErrors } from "../common/utils";
import { graphql } from "../generated/gql";
import { routes } from "../routes";
import successfulLottie from "./successful-lottie.json";

const REGISTER_MUTATION = graphql(/*GraphQL*/ `
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      __typename
      ... on RegisterSuccess {
        id
      }
      ... on RegisterProblem {
        title
        invalidInputs {
          field
          message
        }
      }
    }
  }
`);

const formSchema = z
  .object({
    email: z.string().email("Invalid email").min(1, "Email is required"),
    password: z.string().min(1, "Password is required").min(8, "Password must have more than 8 characters"),
    passwordAgain: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.passwordAgain, {
    path: ["passwordAgain"],
    message: "Passwords do not match",
  });
type FormSchemaType = z.infer<typeof formSchema>;

export const RegisterPage = () => {
  const [registerUser, { loading, data }] = useMutation(REGISTER_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FormSchemaType> = ({ email, password }) => {
    registerUser({ variables: { email, password } });
  };

  const errors = mergeErrors({
    serverProblem: data?.register?.__typename === "RegisterProblem" ? data.register : null,
    formErrors,
  });

  return (
    <Grid
      h="100vh"
      alignItems={"center"}
      justifyContent={"center"}
      bgGradient="radial-gradient(circle at 0% 0%, pink.700 0%, purple.500 40%)"
    >
      <Flex direction={"column"}>
        <Heading textTransform={"uppercase"} color={"white"} fontWeight={"bold"}>
          Chat App
        </Heading>
        <Box bg={"white"} p={10} px={12} width={"xs"} boxShadow={"lg"} borderRadius={"lg"}>
          {data?.register?.__typename !== "RegisterSuccess" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <Flex direction={"column"} gap={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    {...register("email", { value: "test@m.com" })}
                    placeholder="Email"
                    autoFocus
                    variant="filled"
                  />
                  {errors.email && <FormErrorMessage>{errors.email.message as string}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    {...register("password")}
                    placeholder="Must have at least 8 characters"
                    type="password"
                    variant="filled"
                  />
                  {errors.password && <FormErrorMessage>{errors.password.message as string}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    {...register("passwordAgain")}
                    placeholder="Your password again"
                    type="password"
                    variant="filled"
                  />
                  {errors.passwordAgain && (
                    <FormErrorMessage>{errors.passwordAgain.message as string}</FormErrorMessage>
                  )}
                </FormControl>

                <Button type="submit" colorScheme={"purple"} variant={"solid"} mt={4} isLoading={loading}>
                  Register
                </Button>
              </Flex>
            </form>
          ) : (
            <Flex direction={"column"} align={"center"}>
              <LottiePlayer loop={false} animationData={successfulLottie} />
              <Text fontWeight={"bold"}>Registered!</Text>
            </Flex>
          )}
        </Box>

        <Link as={RouterLink} to={routes.LOGIN} color="white" mx={"auto"} mt={1}>
          Already registered? Log in.
        </Link>
      </Flex>
    </Grid>
  );
};
