import { IParentChild } from "types/interfaces";
import { getAccessToken } from "utils/getTokens";
import http from "../axios.config";

const addChild = async (data: any) => {
   const response = await http.post("/parent/child/", data, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });

   return response.data;
};

const addChildFriends = async (data: any) => {
   const response = await http.post("/parent/child/friend-request/", data, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });

   return response.data;
};

const getAllChildren = async () => {
   const response = await http.get("/parent/child/", {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

const getChildProgress = async (id: string | number) => {
   const response = await http.get(`/parent/child/${id}/progress/`, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

const getChildBlockGameProgress = async (id: string | number) => {
   const response = await http.get(`/parent/child/${id}/block-progress/`, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

const getChildBlockGameSkill = async (id: string | number) => {
   const response = await http.get(`/parent/child/${id}/block-skills/`, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

const updateChildScreentime = async (data: any, id: string | number) => {
   const response = await http.put(
      "/parent/child/time-limit/" + id + "/",
      { ...data },
      {
         headers: {
            Authorization: `Bearer ${getAccessToken()}`,
         },
      }
   );

   return response.data;
};

const createChildLevelThresHold = async (data: any, id: string | number) => {
   const response = await http.post(`/parent/child/level_thresholds_limit/child/${id}/`, data, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

const getChildLevelThresHold = async (childId: number) => {
   const response = await http.get(`/users/student/${childId}/threshold-limit/`,
       { headers: { Authorization: `Bearer ${getAccessToken()}` } });

   return response?.data;
};

const getChildScreentime = async (childId: number) => {
   const response = await http.get(`/users/student/${childId}/screen-time/`, { headers: { Authorization: `Bearer ${getAccessToken()}` } });

   return response?.data;
};

const replyFriendRequest = async (data: { accepted: boolean; rejected: boolean }, id: number) => {
   const response = await http.put(
      `/parent/child/friend-request/${id}`,
      { ...data },
      {
         headers: {
            Authorization: `Bearer ${getAccessToken()}`,
         },
      }
   );
   return response.data;
};

const getChildSkills = async (id: number) => {
   const response = await http.get(`/parent/child/${id}/skills`, { headers: { Authorization: `Bearer ${getAccessToken()}` } });

   return response?.data;
};

const updateChildPassword = async (child_id: number, password: string) => {
   const response = await http.put(
      `/parent/child/${child_id}/update-password/`,
      { password },
      { headers: { Authorization: `Bearer ${getAccessToken()}` } }
   );

   return response?.data;
};

const deleteChild = async (child_id: string | number) => {
  const response = await http.delete(
    `/parent/child/${child_id}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.data;
};

const getChildCodingAccess = async (student_id: string | number) => {
   const response = await http.get(`/academics/block_game/coding-access/${student_id}/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};

const updateChildCodingAccess = async (
   student_id: string | number, 
   data: { line_coding_locked?: boolean; line_coding_console_only?: boolean; block_coding_max_level?: string; locked_levels?: string[] }
) => {
   const response = await http.patch(`/academics/block_game/coding-access/${student_id}/`, data, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};


const parentService = {
   addChild,
   addChildFriends,
   getAllChildren,
   updateChildScreentime,
   createChildLevelThresHold,
   replyFriendRequest,
   getChildScreentime,
   getChildLevelThresHold,
   getChildProgress,
   getChildSkills,
   updateChildPassword,
   getChildBlockGameProgress,
   getChildBlockGameSkill,
   deleteChild,
   getChildCodingAccess,
   updateChildCodingAccess,
};

export default parentService;
