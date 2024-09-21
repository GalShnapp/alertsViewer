import { Text } from "react-aria-components";

export function Card({title, value}:{title: string, value: string}) {
    return (
      <div className="shadow m-6 flex flex-row gap-2 px-2 ">
        <Text className="flex-col text-gray-500">{title}</Text>
        <Text className="flex-col font-bold">{value}</Text>
      </div>
    );
}