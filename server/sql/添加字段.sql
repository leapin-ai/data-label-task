DO
$$
BEGIN
    IF
NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 't_data_source'
        AND column_name = 'group_name'
    ) THEN
ALTER TABLE "public"."t_data_source"
    ADD COLUMN "group_name" VARCHAR(255);

COMMENT
ON COLUMN "public"."t_data_source"."group_name" IS '分组名称';
END IF;

    IF
NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 't_data_source'
        AND column_name = 'group_index'
    ) THEN
ALTER TABLE "public"."t_data_source"
    ADD COLUMN "group_index" INTEGER;

COMMENT
ON COLUMN "public"."t_data_source"."group_index" IS '分组排序';
END IF;
END
$$;