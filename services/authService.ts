import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearFields, resetAuthUser, updateUser } from "store/authSlice";
import http from "../axios.config";
import { closePreloader, openErrorModal, openPreloader } from "store/fetchSlice";
import { getAccessToken, getUserFromLocalStorage } from "utils/getTokens";
import { RootState } from "store/store";
import { errorResolver } from "utils/errorResolver";
import { ILoginReducerArg, IUser } from "types/interfaces";
import { ILocalStorageItems } from "types/interfaces/localstorage.interface";
import { referralHeaders } from "utils/referral";

export const loginUser: any = createAsyncThunk("authSlice/loginUser", async (name, thunkApi): Promise<ILoginReducerArg | any> => {
   const state = <RootState>thunkApi.getState();
   const dispatch = thunkApi.dispatch;
   const { email, password } = state.user.auth;
   dispatch(openPreloader({ loadingText: "Logging You in" }));

   const body: Partial<IUser> = { password };

   // We're using the email property in the state for the input to control both username and email for the login!!!!!!
   if (email.includes("@")) {
      body.email = email;
   } else {
      body.username = email;
   }
   try {
      const { data } = await http.post<ILoginReducerArg>("/auth/login/", body);
      dispatch(clearFields());
      dispatch(closePreloader());

      return {
         access_token: data.access_token,
         refresh_token: data.refresh_token,
         ...data.user,
      };
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const signUpUser: any = createAsyncThunk("authSlice/signUpUser", async (name, thunkApi) => {
   const state: any = thunkApi.getState();
   const dispatch = thunkApi.dispatch;

   const policyChecked = state.policyCheck.checked;

   if (!policyChecked) {
      dispatch(openErrorModal({ errorText: ["You have not accepted the terms and conditions"] }));

      return thunkApi.rejectWithValue("Accept privacy policy");
   } else {
      const {
         email,
         organization_code,
         firstname,
         lastname,
         schoolName,
         grade,
         is_parent,
         is_organizer,
         is_student,
         is_teacher,
         dob,
         schoolCountry,
         country,
         username,
      } = state?.user?.auth;

      // General Options
      let options: typeof state.user.auth = {
         email,
         password1: state.user.auth.password,
         password2: state.user.auth.password,
         firstname,
         is_parent,
         is_organizer,
         is_student,
         is_teacher,
         username,
         organization_code,
      };
      // some google accounts do not have lastname
      if (lastname) {
         options.lastname = lastname;
      }

      if (is_teacher) {
         options = { ...options, country: schoolCountry, schoolCountry, schoolName, grade: undefined };
      }

      if (is_student) {
         options = { ...options, country, grade, schoolCountry: undefined, schoolName: undefined, dob };
      }

      if (is_parent) {
         options = { ...options, country: country, grade: undefined, schoolCountry: undefined, schoolName: undefined };
      }

      if (is_organizer) {
         options = { ...options, country: country, schoolCountry: undefined, schoolName: undefined, grade: undefined };
      }

      dispatch(openPreloader({ loadingText: "Creating Account" }));

      localStorage.setItem(ILocalStorageItems.signupAccountType, is_teacher ? "teacher" : is_parent ? "parent" : "student");
      try {
         // Referral headers, not body fields. The backend attaches attribution
         // from the signup signal, which only ever sees the raw request.
         const { data } = await http.post("/auth/registration/", { ...options, source: "web" }, { headers: referralHeaders() });
         dispatch(clearFields());
         dispatch(closePreloader());

         return data;
      } catch (error: any) {
         const errorMessage = errorResolver(error);
         return thunkApi.rejectWithValue(errorMessage);
      }
   }
});

export const signUpWithGoogle: any = createAsyncThunk(
   "authSlice/signUpWithGoogle",
   async (payload: { access_token: string; role: string }, thunkApi) => {
      const { dispatch } = thunkApi;
      dispatch(openPreloader({ loadingText: "Registering your Google account" }));

      try {
         const res = await http.post(
            "/auth/google/",
            {
               access_token: payload.access_token,
               role: payload.role,
            },
            { headers: referralHeaders() },
         );

         dispatch(closePreloader());

         // ✅ If backend intentionally sends 202 — treat it as success but flag it
         if (res.status === 202) {
            const details = res.data?.details?.[0];
            return {
               role_addition_required: true,
               confirmation_token: details?.confirmation_token,
               message: details?.message,
            };
         }

         // ✅ Normal signup success
         return {
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token,
            ...res.data.user,
         };
      } catch (error: any) {
         dispatch(closePreloader());

         const errorMessage = errorResolver(error);
         return thunkApi.rejectWithValue(errorMessage);
      }
   }
);

export const loginWithGoogle: any = createAsyncThunk("authSlice/loginWithGoogle", async (access_token: string, thunkApi) => {
   const dispatch = thunkApi.dispatch;

   dispatch(openPreloader({ loadingText: "Signing in with Google" }));

   try {
      // Referral headers here too: an email Google has never signed in with
      // before creates an account on this call, not on the signup one.
      const res = await http.post<ILoginReducerArg>(
         "/auth/google/",
         {
            access_token,
            action: "signin",
         },
         { headers: referralHeaders() },
      );

      dispatch(closePreloader());

      // RoleAdditionConfirmationRequired is an APIException with status 202, so
      // axios resolves it. Reading it in the catch block below - which is where
      // it used to be handled - meant this branch never ran, and the caller got
      // an object with undefined tokens that still looked like a success.
      if (res.status === 202) {
         const details = res.data?.details?.[0] || {};
         return {
            role_addition_required: true,
            confirmation_token: details.confirmation_token,
            message: details.message,
         };
      }

      const data = res.data;

      return {
         access_token: data.access_token,
         refresh_token: data.refresh_token,
         ...data.user,
      };
   } catch (error: any) {
      dispatch(closePreloader());

      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const updateAccountType: any = createAsyncThunk("authSlice/updateAccountType", async (accountType: string, thunkApi) => {
   const is_parent: boolean = accountType === "Parent";
   const is_teacher: boolean = accountType === "Teacher";
   const is_student: boolean = accountType === "Student";
   const is_organizer: boolean = accountType === "Organizer";
   const state = <RootState>thunkApi.getState();
   const { firstname, lastname, email, country, schoolCountry, schoolName, grade, username } = state.user;

   const requestBody = {
      firstname,
      lastname,
      email,
      country: country ? country : "Canada",
      schoolCountry,
      schoolName,
      is_student,
      is_teacher,
      is_parent,
      is_organizer,
      grade,
      username,
   };
   console.log(requestBody);
   try {
      const { data } = await http.put("/auth/user/", requestBody, {
         headers: {
            Authorization: `Bearer ${getAccessToken()}`,
         },
      });
      return data;
   } catch (error) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const confirmAddRole: any = createAsyncThunk("authSlice/confirmAddRole", async (confirmation_token: string, thunkApi) => {
   const dispatch = thunkApi.dispatch;

   dispatch(openPreloader({ loadingText: "Adding role to your account" }));

   try {
      const { data } = await http.post<ILoginReducerArg>("/auth/social/confirm-add-role/", {
         confirmation_token,
      });

      dispatch(closePreloader());

      return {
         access_token: data.access_token,
         refresh_token: data.refresh_token,
         ...data.user,
      };
   } catch (error: any) {
      dispatch(closePreloader());

      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const updateFirstname: any = createAsyncThunk("authSlice/updateFirstname", async (_, thunkApi) => {
   const state = <RootState>thunkApi.getState();
   const { firstname } = state.user.auth;
   const dispatch = thunkApi.dispatch;
   const { lastname, email, country, schoolCountry, schoolName, is_student, is_teacher, is_parent, is_organizer, grade, username } = state.user;
   try {
      const { data } = await http.put(
         "/auth/user/",
         {
            firstname,
            lastname,
            email,
            country,
            schoolCountry,
            schoolName,
            is_student,
            is_teacher,
            is_parent,
            is_organizer,
            grade,
            username,
         },
         {
            headers: {
               Authorization: `Bearer ${getAccessToken()}`,
            },
         }
      );
      dispatch(updateUser({ key: "firstname", value: "" }));
      return data;
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const updateLastname: any = createAsyncThunk("authSlice/updateLastname", async (_, thunkApi) => {
   const state = <RootState>thunkApi.getState();
   const { lastname } = state.user.auth;
   const dispatch = thunkApi.dispatch;
   const { firstname, email, country, schoolCountry, schoolName, is_student, is_teacher, is_parent, is_organizer, grade, username } = state.user;
   try {
      const { data } = await http.put(
         "/auth/user/",
         {
            lastname,
            firstname,
            email,
            country,
            schoolCountry,
            schoolName,
            is_student,
            is_teacher,
            is_parent,
            is_organizer,
            grade,
            username,
         },
         {
            headers: {
               Authorization: `Bearer ${getAccessToken()}`,
            },
         }
      );
      dispatch(updateUser({ key: "lastname", value: "" }));
      return data;
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const updateEmail: any = createAsyncThunk("authSlice/updateEmail", async (_, thunkApi) => {
   const state = <RootState>thunkApi.getState();
   const { email } = state.user.auth;
   const dispatch = thunkApi.dispatch;
   const { lastname, firstname, country, schoolCountry, schoolName, is_student, is_teacher, is_parent, is_organizer, grade, username } = state.user;
   try {
      const { data } = await http.put(
         "/auth/user/",
         {
            email,
            lastname,
            firstname,
            country,
            schoolCountry,
            schoolName,
            is_student,
            is_teacher,
            is_organizer,
            is_parent,
            grade,
            username,
         },
         {
            headers: {
               Authorization: `Bearer ${getAccessToken()}`,
            },
         }
      );
      dispatch(updateUser({ key: "email", value: "" }));
      return data;
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});

export const verifyEmail: any = createAsyncThunk("/auth/confirm=email", async (key: string, thunkApi) => {
   try {
      const resp = await http.post("/auth/confirm-email/", { key });

      return resp.data;
   } catch (error: any) {
      if (error?.response?.status == 404) {
         // check if it's a parent signup
         const signUpType = JSON.parse(localStorage.getItem(ILocalStorageItems.parent_signup) as string);

         localStorage.removeItem("parent-signup");
         if (signUpType) {
            window.open("", "_self");
            window.close();
         } else {
            const accountSigningup = localStorage.getItem(ILocalStorageItems?.signupAccountType);

            window.location.href = `/login/${accountSigningup}`;
         }
      }

      return thunkApi.rejectWithValue(error?.response?.data);
   }
});

export const resendEmail: any = createAsyncThunk("/auth/resend-email", async (email: string, thunkApi) => {
   const dispatch = thunkApi.dispatch;

   dispatch(openPreloader({ loadingText: "Resending Email" }));

   try {
      const resp = await http.post("/auth/registration/resend-email/", { email });

      dispatch(closePreloader());

      return resp.data;
   } catch (error) {
      error = errorResolver(error);
      return thunkApi.rejectWithValue(error);
   }
});

export const logout: any = createAsyncThunk("/auth/logout", async (_, thunkApi) => {
   localStorage.removeItem("token");
   localStorage.removeItem("token_timestamp");
   thunkApi.dispatch(resetAuthUser());
   window.location.href = "/login";
});

/**
 * One call that saves both names. The older updateFirstname/updateLastname
 * thunks read the value out of state.user.auth, which is the sign up form
 * slice - it is empty on a normal page load, so saving from the user menu sent
 * whatever half of the form had been typed and pushed a blank field to the API.
 * This one takes the values from the caller and merges them over the user we
 * already have.
 */
export const updateName: any = createAsyncThunk("authSlice/updateName", async (payload: { firstname: string; lastname: string }, thunkApi) => {
   const state = <RootState>thunkApi.getState();
   const stored = getUserFromLocalStorage() || {};
   const current: any = { ...stored, ...state.user };
   const { email, country, schoolCountry, schoolName, is_student, is_teacher, is_parent, is_organizer, grade, username } = current;

   try {
      const { data } = await http.put(
         "/auth/user/",
         {
            firstname: payload.firstname,
            lastname: payload.lastname,
            email,
            country,
            schoolCountry,
            schoolName,
            is_student,
            is_teacher,
            is_parent,
            is_organizer,
            grade,
            username,
         },
         {
            headers: {
               Authorization: `Bearer ${getAccessToken()}`,
            },
         }
      );

      return data;
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkApi.rejectWithValue(errorMessage);
   }
});
