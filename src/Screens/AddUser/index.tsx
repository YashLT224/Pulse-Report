// import { useState, useEffect } from "react";

// import { Schema } from "../../../amplify/data/resource";
// import { useAuthenticator } from "@aws-amplify/ui-react";
// import { generateClient } from "aws-amplify/data";

// const client = generateClient<Schema>();

const AddUser = () => {
    // const { user } = useAuthenticator();
    // const [currentUser, setCurrentUser] = useState<any>(null);
    // const [staffMembers, setStaffMembers] = useState<any>([]);

    // useEffect(() => {
    //     client.models.UserProfile.list({ userId: user.userId! }).then(user => {
    //         setCurrentUser(user);
    //     });

    //     client.models.UserProfile.listByRole({ role: "staff" }).then(members =>
    //         setStaffMembers(members)
    //     );
    // }, [user.userId]);

    return (
        <div>
            <h1>AddUser</h1>
            {/* <pre>{JSON.stringify(currentUser, null, 2)}</pre>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <pre>{JSON.stringify(staffMembers, null, 2)}</pre> */}
        </div>
    );
};

export default AddUser;
