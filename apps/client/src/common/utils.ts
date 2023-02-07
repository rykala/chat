import { compareDesc, formatDistanceToNowStrict as baseFormatDistanceToNowStrict } from "date-fns";
import { enUS } from "date-fns/locale";
import { FieldErrors } from "react-hook-form/dist/types/errors";
import { Problem } from "../generated/gql/graphql";

const strictUnit = {
  xSeconds: "s",
  xMinutes: "min",
  xHours: "h",
  xDays: "d",
  xMonths: "mo",
  xYears: "y",
};

export const formatDistanceToNowStrict = (date: Parameters<typeof baseFormatDistanceToNowStrict>[0]) => {
  return baseFormatDistanceToNowStrict(date, {
    locale: {
      ...enUS,
      formatDistance: (unit: string, count: number) => {
        if (unit === "xSeconds") {
          return "now";
        }
        return `${count} ${strictUnit[unit as keyof typeof strictUnit]}`;
      },
    },
  });
};

export const getConversationName = <T extends { email: string }>(participants: T[]) =>
  participants.map((p) => p.email).join(", ");

export const sortByLastMessageTimestamp = <T extends { messages: { items: Array<{ timestamp: string }> } }>(
  item1: T,
  item2: T,
) => {
  if (item1.messages.items.length === 0 || item2.messages.items.length === 0) {
    return -1;
  }
  return compareDesc(new Date(item1.messages.items[0].timestamp), new Date(item2.messages.items[0].timestamp));
};

export const mergeErrors = ({
  formErrors,
  serverProblem,
}: {
  formErrors: FieldErrors;
  serverProblem?: Problem | null;
}) => {
  if (!serverProblem || !serverProblem.invalidInputs) {
    return formErrors;
  }
  return {
    ...serverProblem.invalidInputs.reduce((acc, { field, message }) => ({ ...acc, [field]: { message } }), {}),
    ...formErrors,
  };
};
