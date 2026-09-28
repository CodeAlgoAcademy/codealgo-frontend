import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ILoginReducerArg, IUser, IUserData } from "../types/interfaces";
import { RootState } from "./store";
import {
   loginUser,
   signUpUser,
   loginWithGoogle,
   loginWithApple,
   signUpWithApple,
   updateFirstname,
   updateLastname,
   updateEmail,
   signUpWithGoogle,
   updateAccountType,
   confirmAddRole,
   updateName,
} from "services/authService";
import { countryList } from "@/components/signup/countries";
import { addUserToLocalStorage, setTimeStamp, updateUserInLocalStorage } from "utils/getTokens";

const initialState: IUser = {
   id: 0,
   firstname: "",
   lastname: "",
   username: "",
   email: "",
   isActive: false,
   createdAt: "",
   updatedAt: "",
   access_token: "",
   refresh_token: "",
   // sign up stuffs
   country: "",
   // peculiar to students
   grade: "",
   // peculiar to teachers
   schoolCountry: "",
   schoolName: "",
   is_parent: false,
   is_organizer: false,
   is_student: false,
   is_teacher: false,
   dob: "",
   organization_code: "",
   auth: {
      organization_code: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      // peculiar to students
      grade: "",
      // peculiar to teachers
      schoolCountry: countryList[0],
      schoolName: "",
      is_parent: false,
      is_student: true,
      is_organizer: false,
      is_teacher: false,
      country: countryList[0],
      username: "",
      dob: "",
   },
};

export const userSlice = createSlice({
   name: "user",
   initialState,
   reducers: {
      logOut: () => {
         localStorage.removeItem("token");
      },
      clearFields: (state: IUser) => {
         return {
            ...state,
            auth: {
               ...initialState.auth,
               email: state.auth.email,
               password: state.auth.password,
               is_student: state.auth.is_student,
               is_parent: state.auth.is_parent,
               is_teacher: state.auth.is_teacher,
               is_organizer: state.auth.is_organizer,
            },
         };
      },
      updateUser: (
         state: IUser | any,
         action: PayloadAction<{
            key: string;
            value: string;
         }>
      ) => {
         if (action.payload.key === "accountType") {
            state.auth.is_parent = action.payload.value === "Parent" ? true : false;
            state.auth.is_teacher = action.payload.value === "Teacher" ? true : false;
            state.auth.is_student = action.payload.value === "Student" ? true : false;
            state.auth.is_organizer = action.payload.value === "Organizer" ? true : false;
         } else {
            state.auth[action.payload.key as keyof typeof state.auth] = action.payload.value;
         }
      },
      resetAuthUser: (state: IUser) => {
         return initialState;
      },
      addUserFromLocalStorage: (state: IUser, action: PayloadAction<IUser>) => {
         return { ...action.payload, auth: state.auth };
      },
      // i'm using this in place of extra reducers because of page restrictions
      // storeUserLogin: (state: IUser, action: PayloadAction<ILoginReducerArg>) => {
      //    const user: Partial<IUser> = {
      //       access_token: action.payload.access_token,
      //       refresh_token: action.payload.refresh_token,
      //       ...action.payload.user,
      //    };

      //    addUserToLocalStorage(user);

      //    state = {
      //       ...state,
      //       ...action.payload.user,
      //    };
      // },
   },
   extraReducers: (builder) => {
      builder.addCase(loginUser.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         addUserToLocalStorage(action?.payload);

         return {
            ...state,
            ...action.payload,
         };
      });

      // Both social thunks can resolve with a role-confirmation payload instead
      // of a session - the backend answers that case with 202, which axios
      // treats as success. Writing it to localStorage would overwrite a real
      // token with undefined and log the user out.
      builder.addCase(loginWithGoogle.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         if (!action.payload?.access_token) return state;

         addUserToLocalStorage(action.payload);

         return {
            ...state,
            ...action.payload,
         };
      });

      builder.addCase(signUpWithGoogle.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         if (!action.payload?.access_token) return state;

         addUserToLocalStorage(action.payload);
         return {
            ...state,
            ...action.payload,
         };
      });
      builder.addCase(confirmAddRole.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         addUserToLocalStorage(action.payload);
         return {
            ...state,
            ...action.payload,
         };
      });

      builder.addCase(loginWithApple.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         addUserToLocalStorage(action.payload);
         return {
            ...state,
            ...action.payload,
         };
      });

      builder.addCase(signUpWithApple.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         addUserToLocalStorage(action.payload);
         return {
            ...state,
            ...action.payload,
         };
      });

      builder.addCase(updateFirstname.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         updateUserInLocalStorage(action.payload);

         return { ...state, ...action.payload };
      });

      builder.addCase(updateLastname.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         updateUserInLocalStorage(action.payload);

         return { ...state, ...action.payload };
      });
      builder.addCase(updateEmail.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         updateUserInLocalStorage(action.payload);

         return { ...state, ...action.payload };
      });
      builder.addCase(updateName.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         if (!action.payload) return state;

         const merged: any = { ...state, ...action.payload };
         // auth is the sign up form slice - it holds a password and has no
         // business in localStorage.
         const { auth, ...cached } = merged;
         updateUserInLocalStorage(cached);

         return merged;
      });

      builder.addCase(updateAccountType.fulfilled, (state: IUser, action: PayloadAction<IUser>) => {
         updateUserInLocalStorage(action.payload);

         return { ...state, ...action.payload };
      });
   },
});

// Action creators are generated for each case reducer function
export const { logOut, clearFields, updateUser, resetAuthUser, addUserFromLocalStorage } = userSlice.actions;

export default userSlice.reducer;
