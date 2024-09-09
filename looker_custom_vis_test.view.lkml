view: looker_custom_vis_test {
  derived_table: {
    sql: SELECT 1 AS num ;;
  }
  dimension: test {
    type: number
    sql: ${TABLE}.num;;
  }
}
