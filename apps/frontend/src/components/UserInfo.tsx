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
    <div className="flex md:gap-3 gap-2 items-center select-none">
      {image && (
        <Image
          src={image}
          alt="avatar"
          width={40}
          height={40}
          className="md:w-10 w-8 md:h-10 h-8 rounded-md ring-2 ring-white/10 shadow-lg transition-all duration-200 ease-out hover:shadow-xl hover:ring-white/20"
        />
      )}
      <h3 className="md:text-md text-md font-semibold">{name} (400)</h3>
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
    <div className="relative w-fit h-fit select-none">
      {image && (
        <Image
          src={image}
          alt="avatar"
          width={80}
          height={80}
          className="rounded-lg w-20 h-20 ring-2 ring-white/10 shadow-lg transition-all duration-200 ease-out hover:shadow-xl hover:ring-white/20"
        />
      )}
      <div className="absolute -bottom-2 -right-2 z-10 bg-white/10 rounded-full p-1 shadow-md">
        <Image
          alt="piece"
          width={100}
          height={100}
          src={`/pieces/${color[0]}k.png`}
          className="w-8 h-8"
        />
      </div>
    </div>
  );
}
