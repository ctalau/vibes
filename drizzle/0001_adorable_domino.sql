CREATE TABLE "favorites" (
        "user_id" uuid NOT NULL,
        "app_slug" text NOT NULL,
        "created_at" timestamp with time zone DEFAULT now(),
        CONSTRAINT "favorites_user_id_app_slug_pk" PRIMARY KEY("user_id","app_slug")
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
