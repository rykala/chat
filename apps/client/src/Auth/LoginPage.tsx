import { useMutation } from "@apollo/client";
import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Grid, Heading, Input, Link } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { z, ZodTypeAny } from "zod";
import { mergeErrors } from "../common/utils";
import { graphql } from "../generated/gql";
import { MutationLoginArgs } from "../generated/gql/graphql";
import { routes } from "../routes";

const LOGIN_MUTATION = graphql(/*GraphQL*/ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ... on LoginSuccess {
        session {
          userId
        }
      }
      ... on LoginProblem {
        title
        invalidInputs {
          field
          message
        }
      }
    }
  }
`);

type MutationLoginArgsSchema = {
  [K in keyof MutationLoginArgs]: ZodTypeAny;
};

const formSchema = z.object<MutationLoginArgsSchema>({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});
type FormSchemaType = z.infer<typeof formSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [login, { data }] = useMutation(LOGIN_MUTATION, {
    onCompleted: ({ login }) => {
      if (login?.__typename === "LoginSuccess") {
        navigate(location.state?.from ?? routes.CHAT);
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FormSchemaType> = ({ email, password }) => login({ variables: { email, password } });

  const errors = mergeErrors({
    serverProblem: data?.login?.__typename === "LoginProblem" ? data.login : null,
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Flex
            direction={"column"}
            bg={"white"}
            p={10}
            px={12}
            width={"xs"}
            boxShadow={"lg"}
            borderRadius={"lg"}
            gap={4}
          >
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                {...register("email", { value: "user@m.com" })}
                placeholder="Your email"
                autoFocus
                variant="filled"
              />
              {errors.email && <FormErrorMessage>{errors.email.message as string}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                {...register("password", { value: "pass" })}
                placeholder="Your password"
                type="password"
                variant="filled"
              />
              {errors.password && <FormErrorMessage>{errors.password.message as string}</FormErrorMessage>}
            </FormControl>
            <Button type="submit" colorScheme={"purple"} variant={"solid"} mt={4}>
              Log In
            </Button>
          </Flex>
        </form>

        <Link as={RouterLink} to={routes.REGISTER} color="white" mx={"auto"} mt={1}>
          Don't have an account? Register.
        </Link>
      </Flex>
    </Grid>
  );
};
