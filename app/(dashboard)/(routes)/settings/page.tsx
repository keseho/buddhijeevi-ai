import { Settings } from "lucide-react";
import Heading from "@/components/heading";
import { getApiLimitCount } from "@/lib/api-limit";
import { MAX_FREE_COUNTS } from "@/constants";

const SettingsPage = async () => {
  const apiLimitCount = await getApiLimitCount(); // Assuming this function returns a value
  const queriesLeft = MAX_FREE_COUNTS - apiLimitCount;

  return (
    <div>
      <Heading
        title="Settings"
        description="Manage account settings."
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          You have {queriesLeft} queries left for the day.
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
