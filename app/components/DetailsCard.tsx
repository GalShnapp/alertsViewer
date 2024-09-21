import { Text } from "react-aria-components";

export function Card({title, children}:{title: string | undefined, children?: React.ReactNode}) {
    return (
      <div className="my-4">
        <Text className="text-gray-500 mx-6">{title}</Text>
        {children}
      </div>
    );
}