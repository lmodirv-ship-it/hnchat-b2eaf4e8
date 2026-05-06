/**
 * useRealtimeFeed — Live feed updates with reactions and comments.
 * Subscribes to posts, likes, and comments for instant UI updates.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface FeedEvent {
  type: "new_post" | "like" | "unlike" | "comment";
  postId?: string;
  userId?: string;
  timestamp: string;
}

export function useRealtimeFeed() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [liveEvents, setLiveEvents] = useState<FeedEvent[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const clearNewPosts = useCallback(() => {
    setNewPostsCount(0);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("feed-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const post = payload.new as { user_id: string; id: string };
          if (post.user_id !== user?.id) {
            setNewPostsCount((n) => n + 1);
          }
          setLiveEvents((prev) => [
            { type: "new_post", postId: post.id, userId: post.user_id, timestamp: new Date().toISOString() },
            ...prev.slice(0, 49),
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likes" },
        (payload) => {
          const like = payload.new as { post_id: string; user_id: string };
          // Invalidate specific post data
          qc.invalidateQueries({ queryKey: ["feed-posts"] });
          setLiveEvents((prev) => [
            { type: "like", postId: like.post_id, userId: like.user_id, timestamp: new Date().toISOString() },
            ...prev.slice(0, 49),
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "likes" },
        (payload) => {
          const like = payload.old as { post_id: string };
          qc.invalidateQueries({ queryKey: ["feed-posts"] });
          setLiveEvents((prev) => [
            { type: "unlike", postId: like.post_id, timestamp: new Date().toISOString() },
            ...prev.slice(0, 49),
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const comment = payload.new as { post_id: string; user_id: string };
          qc.invalidateQueries({ queryKey: ["feed-posts"] });
          setLiveEvents((prev) => [
            { type: "comment", postId: comment.post_id, userId: comment.user_id, timestamp: new Date().toISOString() },
            ...prev.slice(0, 49),
          ]);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  return { newPostsCount, clearNewPosts, liveEvents };
}
