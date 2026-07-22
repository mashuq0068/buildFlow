"use client";

import { useEffect } from "react";
import {
  joinIssueRoom,
  leaveIssueRoom,
  joinProjectRoom,
  leaveProjectRoom,
} from "@/lib/socket";

export function useIssueRoom(issueId: string | undefined) {
  useEffect(() => {
    if (!issueId) return;
    joinIssueRoom(issueId);
    return () => leaveIssueRoom(issueId);
  }, [issueId]);
}

export function useProjectRoom(projectId: string | undefined) {
  useEffect(() => {
    if (!projectId) return;
    joinProjectRoom(projectId);
    return () => leaveProjectRoom(projectId);
  }, [projectId]);
}
