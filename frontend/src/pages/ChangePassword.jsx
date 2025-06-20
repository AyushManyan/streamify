import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser"
import { useState } from "react";
import { changePasswordFn } from "../libs/api";
import { LoaderIcon, ShipWheelIcon } from "lucide-react";

const ChangePassword = () => {
    const { userAuth } = useAuthUser();
    const [changePassword, setChangePassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [localError, setLocalError] = useState("");

    const queryClient = useQueryClient();
    const { mutate: changePasswordMutation, isPending, error } = useMutation({
        mutationFn: changePasswordFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            window.location.href = "/login";
        },
        enabled: Boolean(userAuth),
    });

    const handleChangePassword = (e) => {
        e.preventDefault();
        setLocalError("");
        if (changePassword.newPassword !== changePassword.confirmNewPassword) {
            setLocalError("New password and confirm password do not match.");
            return;
        }
        changePasswordMutation(changePassword);
    }

    return (
        <div className="h-screen flex items-center justify-center pd-4 sm:p-6 md:p-8" data-theme={"userAuth.theme"}>
            <div className="border border-primary/25 flex flex-col w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
                <div className="w-full p-4 sm:p-8 flex flex-col justify-center items-center">
                    <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                    {(error || localError) && (
                        <div className="alert alert-error shadow-lg mb-4">
                            <span>{localError || (error?.response?.data?.message)}</span>
                        </div>
                    )}
                    <form onSubmit={handleChangePassword} className="w-full space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={changePassword.currentPassword}
                                onChange={(e) => setChangePassword({ ...changePassword, currentPassword: e.target.value })}
                                required
                                className="input input-bordered w-full mt-1"
                                disabled={isPending}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={changePassword.newPassword}
                                onChange={(e) => setChangePassword({ ...changePassword, newPassword: e.target.value })}
                                required
                                className="input input-bordered w-full mt-1"
                                disabled={isPending}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                value={changePassword.confirmNewPassword}
                                onChange={(e) => setChangePassword({ ...changePassword, confirmNewPassword: e.target.value })}
                                required
                                className="input input-bordered w-full mt-1"
                                disabled={isPending}
                            />
                        </div>
                        <button className='btn btn-primary w-full' type='submit' disabled={isPending}>
                            {!isPending ? (
                                <>
                                    <ShipWheelIcon className='size-5 mr-2' />
                                    {"Change Password"}
                                </>
                            ) : (
                                <>
                                    <LoaderIcon className='size-5 mr-2 animate-spin' />
                                    {"Changing Password..."}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword