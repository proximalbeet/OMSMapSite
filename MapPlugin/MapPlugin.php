<?php
/**
 * Plugin Name: MapPlugin
 * Description: Displays an interactive Leaflet map using a shortcode.
 */

// Register the shortcode for the map container
add_shortcode('interactive_map', 'interactive_map_shortcode');

function interactive_map_shortcode() {
    return '<div id="interactive-map" style="width: 100%; height: 600px;"></div>';
}

//Load leaflet + plugin file
function map_plugin_assets_enqueue() {
    // Leaflet CSS
    wp_enqueue_style(
        'leaflet-css',
        'https://unpkg.com/leaflet/dist/leaflet.css'
    );

    // Plugin CSS
    wp_enqueue_style(
        'plugin-css',
        plugin_dir_url(__FILE__) . 'assets/css/plugin.css'
    );

    // Leaflet JS
    wp_enqueue_script(
        'leaflet-js',
        'https://unpkg.com/leaflet/dist/leaflet.js',
        array(),
        null,
        true
    );

    // Map Plugin Script
    wp_enqueue_script(
        'MapPlugin-js',
        plugin_dir_url(__FILE__) . 'assets/js/MapPlugin.js',
        array('leaflet-js'),
        '1.1',
        true
    );
}
add_action('wp_enqueue_scripts', 'map_plugin_assets_enqueue');