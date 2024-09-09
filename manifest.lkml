    constant: vis_id {
        value: "looker-custom-viz"
        export: override_optional
    }
    constant: vis_label {
        value: "Looker Custom Viz"
        export: override_optional
    }
    visualization: {
        id: "@{vis_id}"
        label: "@{vis_label}"
        file: "hello_world.js"
        sri_hash: "my_sri_hash"
        dependencies: []
    }