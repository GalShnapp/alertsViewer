import { Text } from "react-aria-components";

export function Card({title, value}:{title: string, value: string}) {
    return (
      <div className="m-6 flex flex-col px-2">
        <Text className="flex-row text-gray-500">{title}</Text>
        <Text className="flex-row font-bold">{value}</Text>
      </div>
    );
}