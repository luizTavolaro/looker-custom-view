view: looker_custom_vis_test {
  derived_table: {
    sql:
SELECT
  produto_titulo,
  nomeClienteServico,
  promoAtual_promocao_dataReferencia,
  promoAtual_promocao_extracao,
  promoAtual_promocao_valorProduto,

  -- SUM(promoAtual_titulos) titulosAtual,
  -- SUM(promoAnterior_titulos) titulosAnterior
  promoAtual_titulos,
  promoAnterior_titulos

FROM `dm_titulos.vendas_caps_crescimento`

WHERE produto_codigo in ('hipercaplitoral', 'hipercapbrasil', 'hipercapmogi', 'natalcap');;

#--GROUP BY 1,2,3,4,5;;
  }
  dimension: produto_titulo {
    type: string
    sql: ${TABLE}.produto_titulo ;;
    label: "Produto"
  }
  dimension: nome_cliente_servico {
    type: string
    sql: ${TABLE}.nomeClienteServico ;;
    label: "Canal de Venda"
  }
  dimension: promo_atual_promocao_extracao {
    type: number
    sql: ${TABLE}.promoAtual_promocao_extracao ;;
    label: "Extração"
  }
  dimension: promo_atual_promocao_valor_produto {
    type: number
    sql: ${TABLE}.promoAtual_promocao_valorProduto ;;
    label: "Valor"
    html: R${{rendered_value}} ;;
  }
  dimension: promo_atual_promocao_data_referencia_date{
    type: date
    datatype: date
    sql: DATE(${TABLE}.promoAtual_promocao_dataReferencia);;
    group_label: "Data da Promoção Atual"
    label: "Data"
    html: {{ rendered_value | date: "%d/%m/%Y" }};;
  }
  dimension: promo_atual_titulos {
    type: number
    sql: ${TABLE}.promoAtual_titulos ;;
    label: "Quantidade de Títulos"
  }
  dimension: promo_anterior_titulos {
    type: number
    sql: ${TABLE}.promoAnterior_titulos ;;
    label: "Quantidade de Títulos"
  }
  measure: promo_atual_total {
    type: sum
    sql: ${promo_atual_titulos} ;;
    label: "Total de Títulos"
  }
  measure: promo_anterior_total {
    type: sum
    sql: ${promo_anterior_titulos} ;;
    label: "Total de Títulos"
  }

}
