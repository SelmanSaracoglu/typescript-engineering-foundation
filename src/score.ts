export type User = {
    name: string;
    score: number;
    active: boolean;
}

export function getQualifiedUsers(users: User[]): User[] {
  const qualifiedUsers: User[] = [];

  for (const user of users) {
    if (user.active && user.score >= 60 ) {
      qualifiedUsers.push({
        name: user.name,
        score: user.score,
        active: user.active
      });
    }
  }
  return qualifiedUsers;
}