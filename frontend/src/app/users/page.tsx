import { userService } from "@/src/services/userService";


export default async function Users(){
    const users = await userService.getAllUsers();
    return (
        <>
        {/* {users.map((user: any) => (
            <div key={user._id}>
                <h1>{user.firstName} {user.lastName}</h1>
                <p>{user.email}</p>
            </div>
        ))} */}
        </>
    )
}