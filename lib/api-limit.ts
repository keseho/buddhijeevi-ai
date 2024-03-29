import { auth, useAuth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { MAX_FREE_COUNTS } from "@/constants";

export const increaseApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const userApiLimit = await prismadb.UserApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (userApiLimit) {
    await prismadb.UserApiLimit.update({
      where: { userId: userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.UserApiLimit.create({
      data: { userId: userId, count: 1 },
    });
  }
};

export const checkApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }
  const userApiLimit = await prismadb.UserApiLimit.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

// export const getApiLimitCount = async () => {
//   const { userId } = auth();

//   if (!userId) {
//     return 0;
//   }

//   const userApiLimit = await prismadb.UserApiLimit.findUnique({
//     where: {
//       userId,
//     },
//   });

//   if (!userApiLimit) {
//     return 0;
//   }

//   return userApiLimit.count;
// };

//upar wala original hai

//neeche likha code ia to implement 5 queries per day wala hisaab
const MAX_QUERIES_PER_DAY = 5;

export const getApiLimitCount = async () => {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  // Find user's API limit entry for the current day
  const userApiLimit = await prismadb.UserApiLimit.findFirst({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
        lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of the day
      },
    },
  });

  if (!userApiLimit) {
    // If no entry exists for the current day, create a new one
    await prismadb.UserApiLimit.create({
      data: {
        userId,
        count: MAX_QUERIES_PER_DAY - 1, // Initial count for the day
      },
    });
    return MAX_QUERIES_PER_DAY - 1;
  }

  return userApiLimit.count;
};
