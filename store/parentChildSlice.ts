import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import parentService from "services/parentChildService";
import { IChildSkill, IParentChild, IParentChildren, screentimeTypes } from "types/interfaces";
import { errorResolver } from "utils/errorResolver";
import { closePreloader, openErrorModal, openPreloader } from "./fetchSlice";
import { RootState } from "./store";
import http from "axios.config";
import { getAccessToken } from "utils/getTokens";
import { setTimeLimit } from "utils/useMultiForm";

const initialState: IParentChildren = {
   // child: {
   children: [],
   currentChild: {
      id: "",
      codingExperience: "",
      dob: "",
      fullName: "",
      password: "",
      username: "",
      friend: "",
      timeLimits: [
         {
            dayOfTheWeek: "Monday", timeLimit: "",
            id: ""
         },
         {
            dayOfTheWeek: "Tuesday", timeLimit: "",
            id: ""
         },
         {
            dayOfTheWeek: "Wednesday", timeLimit: "",
            id: ""
         },
         {
            dayOfTheWeek: "Thursday", timeLimit: "",
            id: ""
         },
         {
            dayOfTheWeek: "Friday", timeLimit: "",
            id: ""
         },
         {
            dayOfTheWeek: "Saturday", timeLimit: "",
            id: ""
         },
         {
            dayOfTheWeek: "Sunday", timeLimit: "",
            id: ""
         },
      ],
      level: 0,
      progress: {
         current: {
            title: "",
            level: 0,
            progress: 0,
         },
         topic: [],
      },
      skills: [],
      levelThresholds: []
   },
   codingExperience: "experienced",
   id: "",
   dob: "",
   fullName: "",
   password: "",
   confirmPassword: "",
   username: "",
   friend: "",
   timeLimits: [
      {dayOfTheWeek: "Monday", timeLimit: "No Limit",id: ""},
      {dayOfTheWeek: "Tuesday", timeLimit: "No Limit",id: ""},
      {dayOfTheWeek: "Wednesday", timeLimit: "No Limit",id: ""},
      {dayOfTheWeek: "Thursday", timeLimit: "No Limit",id: ""},
      {dayOfTheWeek: "Friday", timeLimit: "No Limit",id: ""},
      {dayOfTheWeek: "Saturday", timeLimit: "No Limit",id: ""},
      {dayOfTheWeek: "Sunday", timeLimit: "No Limit",id: ""},
   ],
   levelThresholds: [],
    codingAccess: {
         line_coding_locked: false,
         line_coding_console_only: false,
         block_coding_max_level: ""
      }
};

export const addChild: any = createAsyncThunk("parent/child/new", async (_, thunkAPI) => {
   const state = thunkAPI.getState() as RootState;
   const dispatch = thunkAPI.dispatch;
   const { fullName, password, username, codingExperience, dob, timeLimits } = state.parentChild;
   const timeLimitsFormatted = timeLimits.map((timeInfo: screentimeTypes, index: number) => {
      return {
         ...timeInfo,
         timeLimit: setTimeLimit(timeInfo.timeLimit as string),
      };
   });
   const data = { fullname: fullName, password, username, codingExperience, dob, timeLimits: timeLimitsFormatted };
   dispatch(openPreloader({ loadingText: "Adding Child" }));

   try {
      const child = await parentService.addChild(data);
      dispatch(closePreloader());
      // dispatch(resetChild());
      return child;
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkAPI.rejectWithValue(errorMessage);
   }
});

export const addChildFriend: any = createAsyncThunk("parent/child-friend/new", async (child_name: string, thunkAPI) => {
   const state = <RootState>thunkAPI.getState();
   const dispatch = thunkAPI.dispatch;
   const { friend } = state.parentChild;

   dispatch(openPreloader({ loadingText: "Sending friend request" }));

   try {
      const newFriend = await parentService.addChildFriends({
         student_username: child_name || state.parentChild.currentChild.username || state.parentChild.username,
         username_or_email: friend,
      });
      dispatch(closePreloader());
      dispatch(resetChild());
      return newFriend;
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkAPI.rejectWithValue(errorMessage);
   }
});

export const getChildren: any = createAsyncThunk("parent/children", async (_, thunkAPI) => {
   const state = <RootState>thunkAPI.getState();
   const dispatch = thunkAPI.dispatch;

   try {
      const children = await parentService.getAllChildren();

      return children;
   } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
   }
});

export const getChildProgress: any = createAsyncThunk("parent/child/progress", async (_, thunkAPI) => {
   const state = thunkAPI.getState() as RootState;
   const dispatch = thunkAPI.dispatch;
   try {
      return await parentService.getChildProgress(state.parentChild.currentChild.id);
   } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data);
   }
});

export const fetchChildBlockGameProgress: any = createAsyncThunk("blockGame/getProgress",async (_, thunkAPI) => {
      const state = thunkAPI.getState() as RootState;
      try {
         const id = state.parentChild.currentChild.id;
         return await parentService.getChildBlockGameProgress(id);
      } catch (error: any) {
         return thunkAPI.rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchChildBlockGameSkills: any = createAsyncThunk("blockGame/getSkills",async (_, thunkAPI) => {
      const state = thunkAPI.getState() as RootState;
      try {
         const id = state.parentChild.currentChild.id;
         return await parentService.getChildBlockGameSkill(id);
      } catch (error: any) {
         return thunkAPI.rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const getChildSkills: any = createAsyncThunk("/parent/child/skills", async (_, thunkApi) => {
   const state = <RootState>thunkApi.getState();
   const dispatch = thunkApi.dispatch;
   const childId = <number>state.parentChild.currentChild.id;

   try {
      return await parentService.getChildSkills(childId);
   } catch (error: any) {
      return thunkApi.rejectWithValue(error.response.data);
   }
});

export const editScreentime: any = createAsyncThunk(
   "parent/child/edit-screentime",
   async ({ id, data }: { id: string | number; data: screentimeTypes }, thunkAPI) => {
      const dispatch = thunkAPI.dispatch;

      data.timeLimit = setTimeLimit(data.timeLimit as string);

      dispatch(openPreloader({ loadingText: "Editing Child Screentime" }));

      try {
         const child = await parentService.updateChildScreentime({ ...data }, id);
         dispatch(closePreloader());
         return child;
      } catch (error: any) {
         const errorMessage = errorResolver(error);
         return thunkAPI.rejectWithValue(errorMessage);
      }
   }
);

export const createOrUpdateLevelThreshold: any = createAsyncThunk(
  "parent/child/createOrUpdateLevelThreshold",
  async ({ id, data }: { id: number; data: { level: number; grade: string } }, thunkAPI) => {
    const dispatch = thunkAPI.dispatch;
    try {
      const response = await parentService.createChildLevelThresHold(data, id);
      return response;
    } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);


export const acceptFriendRequest: any = createAsyncThunk("friendRequest/reply", async (id: number, thunkAPI) => {
   const dispatch = thunkAPI.dispatch;
   try {
      const data = await parentService.replyFriendRequest({ accepted: true, rejected: false }, id);
   } catch (error: any) {
      dispatch(openErrorModal({ errorText: [JSON.stringify(error.response.data)] }));
      return thunkAPI.rejectWithValue(error);
   }
});

export const rejectFriendRequest: any = createAsyncThunk("friendRequest/reply", async (id: number, thunkAPI) => {
   const dispatch = thunkAPI.dispatch;
   try {
      const data = await parentService.replyFriendRequest({ accepted: false, rejected: true }, id);
   } catch (error: any) {
      const errorMessage = errorResolver(error);
      return thunkAPI.rejectWithValue(errorMessage);
   }
});

export const updateChildPassword: any = createAsyncThunk(
   "parent/update-child-password",
   async (
      data: {
         child_id: number;
         password: string;
      },
      thunkApi
   ) => {
      const dispatch = thunkApi.dispatch;
      dispatch(openPreloader({ loadingText: "Updating Child's Password" }));

      try {
         const response = await parentService.updateChildPassword(data.child_id, data.password);

         dispatch(closePreloader());

         return response;
      } catch (error) {
         const errorMessage = errorResolver(error);

         return thunkApi.rejectWithValue(errorMessage);
      }
   }
);
export const deleteChild = createAsyncThunk(
   "parent/child/delete",
   async ({ child_id }: {child_id: string | number }, thunkAPI) => {
      const dispatch = thunkAPI.dispatch;
      dispatch(openPreloader({ loadingText: "Deleting student..." }));
      try {
         const response = await parentService.deleteChild(child_id);
         dispatch(closePreloader());
         return { child_id };
      } catch (error: any) {
         const errorMessage = errorResolver(error);
         dispatch(closePreloader());
         return thunkAPI.rejectWithValue(errorMessage);
      }
   }
);

export const fetchChildCodingAccess = createAsyncThunk(
   "parent/child/fetchCodingAccess",
   async (studentId: string | number, thunkAPI) => {
      try {
         return await parentService.getChildCodingAccess(studentId);
      } catch (error: any) {
         return thunkAPI.rejectWithValue(error.response?.data);
      }
   }
);

export const updateChildCodingAccess = createAsyncThunk(
   "parent/child/updateCodingAccess",
   async ({ studentId, data }: { studentId: string | number, data: any }, thunkAPI) => {
      try {
         return await parentService.updateChildCodingAccess(studentId, data);
      } catch (error: any) {
         return thunkAPI.rejectWithValue(error.response?.data);
      }
   }
);


export const parentSlice = createSlice({
   name: "parentChild",
   initialState,
   reducers: {
      updateChild: (
         state: IParentChildren | any,
         action: PayloadAction<{
            key: string;
            value: string;
         }>
      ) => {
         state[action.payload.key as keyof typeof state] = action.payload.value;
      },
      resetChild: (state: IParentChildren) => {
         return { ...initialState, children: state.children, currentChild: state.currentChild };
      },
      resetScreenTime: (state: IParentChildren) => {
         return { ...state, timeLimits: initialState.timeLimits };
      },
      updateScreentime: (state: IParentChildren, action: PayloadAction<{ day: string; hour: number | "No Limit" }>) => {
         state.timeLimits = state?.timeLimits?.map((time) => {
            if (time.dayOfTheWeek === action.payload.day) {
               time.timeLimit = action.payload.hour;
            }
            return time;
         });
      },
      changeCurrentChild: (state: IParentChildren, action: PayloadAction<IParentChild>) => {
         state.currentChild = action.payload;
      },
   },
   extraReducers(builder) {
      builder.addCase(getChildren.fulfilled, (state, action: PayloadAction<IParentChild[]>) => {
         state.children = action.payload;
         // if its another parent child or if it's the first time fetching the students, set them to first parent child else find the student id, (incase of updates!)
         let child = action.payload?.find((student) => student?.id === state.currentChild?.id) as IParentChild;

         if (child) {
            // do not update skills and progress since they're fetched seperately
            const { progress, skills, ...rest } = child;
            child = rest;
            state.currentChild = { ...state.currentChild, ...child };
         } else {
            state.currentChild = action.payload?.[0];
         }
      });
      builder.addCase(getChildProgress.fulfilled, (state, action) => {
         state.currentChild.progress = action.payload;
      });
      builder.addCase(getChildSkills.fulfilled, (state, action: PayloadAction<IChildSkill[]>) => {
         state.currentChild.skills = action.payload;
      });
      builder.addCase(fetchChildBlockGameProgress.fulfilled, (state, action) => {
   if (state.currentChild) {
      state.currentChild.progress = action.payload;
   }
});
      builder.addCase(fetchChildBlockGameSkills.fulfilled, (state, action) => {
   if (state.currentChild) {
      state.currentChild.skills = action.payload;
   }
});
 builder.addCase(createOrUpdateLevelThreshold.fulfilled, (state, action) => {
      if (state.currentChild) {
        const { grade, level } = action.payload
        if (!state.currentChild.levelThresholds) {
          state.currentChild.levelThresholds = []
        }
        const existingIndex = state.currentChild.levelThresholds.findIndex((t: { grade: any }) => t.grade === grade)

        if (existingIndex >= 0) {
          state.currentChild.levelThresholds[existingIndex].level = level
        } else {
          state.currentChild.levelThresholds.push({
             grade, level,
             id: 0
          })
        }
      }
    })

builder.addCase(deleteChild.fulfilled, (state, action) => {
          const { child_id } = action.payload;
          state.children = state.children.filter(child => child.id !== child_id);
          if (state.currentChild.id === child_id) {
             if (state.children.length > 0) {
                state.currentChild = state.children[0];
             } else {
                state.currentChild = initialState.currentChild;
             }
          }
       });
builder
  .addCase(fetchChildCodingAccess.fulfilled, (state, action) => {
   const studentId = action.meta.arg;
   
   state.children = state.children.map(child => 
      String(child.id) === String(studentId) 
      ? { ...child, codingAccess: action.payload } 
      : child
   );

   if (String(state.currentChild?.id) === String(studentId)) {
      state.currentChild.codingAccess = action.payload;
   }
})

   .addCase(updateChildCodingAccess.fulfilled, (state, action) => {
      state.children = state.children.map(child => 
         String(child.id) === String(action.meta.arg.studentId) 
         ? { ...child, codingAccess: action.payload } 
         : child
      );
      if (String(state.currentChild.id) === String(action.meta.arg.studentId)) {
         state.currentChild.codingAccess = action.payload;
      }
   });
   },
})

export const { resetChild, updateChild, updateScreentime, resetScreenTime, changeCurrentChild } = parentSlice.actions;
export default parentSlice.reducer;
