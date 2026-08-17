"use client";

import { useEffect } from "react";
import { recordTopicView } from "./actions";

/** Renders nothing; its only job is to mark a topic as read once it is on screen. */
export default function RecordTopicView({ topicId }: { topicId: string }) {
  useEffect(() => {
    void recordTopicView(topicId);
  }, [topicId]);

  return null;
}
