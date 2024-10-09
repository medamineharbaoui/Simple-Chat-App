import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { RegisterApiResponse } from "../../types";
import useApi from "../../hooks/useApi";
import Input from "../layout/Input";
import Button from "../layout/Button";

export default function Register() {
  const navigate = useNavigate();

  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const { data, handleFetch } = useApi<RegisterApiResponse>();

  const handleSubmit = () => {
    handleFetch({
      url: "/api/users/register/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: userName, userPassword: userPassword }),
    });
  };

  useEffect(() => {
    if (data?.register) {
      navigate("/login");
    }
  }, [data]);

  return (
    <>
      <div className="flex flex-col items-center h-full w-full px-80 py-20">
        <div className="flex flex-col items-center gap-7 w-[400px] h-[400px] rounded-xl bg-slate-300 border-2 border-slate-400">
          <p className="mt-10 text-2xl font-semibold tracking-wider uppercase">
            Register
          </p>
          <form
            className="flex flex-col justify-between items-center w-full h-full px-10 pb-10"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-4">
              <Input
                label="User login"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <Input
                label="User password"
                value={userPassword}
                type="password"
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
            <Button text="Sign up" type="submit" onClick={handleSubmit} />
            <Link to="/login" className="underline">
              Log in here
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}
