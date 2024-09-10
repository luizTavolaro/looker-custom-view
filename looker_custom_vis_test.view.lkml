view: looker_custom_vis_test {
  derived_table: {
    sql:
SELECT "Mage" AS name, "Paladin" AS role UNION ALL
SELECT "Mage" AS name, "Paladin" AS role UNION ALL
SELECT "Mage" AS name, "Paladin" AS role UNION ALL
SELECT "Mage" AS name, "Paladin" AS role UNION ALL
SELECT "Mage" AS name, "Paladin" AS role  ;;
  }
  dimension: name {
    type: string
    sql: ${TABLE}.name;;
  }
  dimension: role {
    type: string
    sql: ${TABLE}.role;;
  }
}
