"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function UserInfo({ id }: { id: string }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    fetch(`/user/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setImage(data.image);
        setName(data.name);
      });
  }, [id]);

  return (
    <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-stone-100 shadow-[0_10px_30px_-20px_rgba(0,0,0,1)] backdrop-blur-md">
      {image && (
        <Image
          src={image}
          alt="avatar"
          width={40}
          height={40}
          className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
        />
      )}
      <span className="truncate max-w-[10rem]">
        {name || "Waiting for player"}
      </span>
    </div>
  );
}

export function UserImage({ id, color }: { id: string; color: string }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    fetch(`/user/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setImage(data.image);
      });
  }, [id]);

  return (
    <div className="relative h-fit w-fit select-none">
      {image && (
        <Image
          src={image}
          alt="avatar"
          width={80}
          height={80}
          className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_24px_60px_-28px_rgba(0,0,0,1)]"
        />
      )}
      <div className="absolute -bottom-2 -right-2 z-10 rounded-full border border-white/10 bg-white/10 p-1.5 shadow-lg backdrop-blur">
        <Image
          alt="piece"
          width={100}
          height={100}
          src={`/pieces/${color[0]}k.png`}
          className="h-7 w-7"
        />
      </div>
    </div>
  );
}
