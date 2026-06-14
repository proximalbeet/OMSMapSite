<?php
/**
 * Plugin Name: MapPlugin
 * Description: Displays an interactive Leaflet map using a shortcode. Data pulled from a public Google Sheet.
 */

// ── Shortcode ────────────────────────────────────────────────────────────────

add_shortcode('interactive_map', 'interactive_map_shortcode');

function interactive_map_shortcode() {
    return '
    <div class="map-plugin-wrapper">
        <div class="map-plugin-header">
            <h2 class="map-plugin-title">OMS Patients By Country</h2>
            <p class="map-plugin-description">
                The map below represents the global reach of OMS patients in our community.
                Each bubble shows the number of patients from that country.
                Click any bubble for details.
            </p>
        </div>
        <div id="interactive-map"></div>
    </div>';
}

// ── Enqueue assets + pass sheet data to JS ───────────────────────────────────

add_action('wp_enqueue_scripts', 'map_plugin_assets_enqueue');

function map_plugin_assets_enqueue() {
    wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet/dist/leaflet.css');
    wp_enqueue_style('plugin-css', plugin_dir_url(__FILE__) . 'assets/css/plugin.css');

    wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet/dist/leaflet.js', array(), null, true);

    wp_enqueue_script(
        'MapPlugin-js',
        plugin_dir_url(__FILE__) . 'assets/js/MapPlugin.js',
        array('leaflet-js'),
        '1.2',
        true
    );

    wp_localize_script('MapPlugin-js', 'MapPluginData', array(
        'features'    => map_plugin_get_sheet_data(),
        'specialists' => map_plugin_get_specialists_data()
    ));
}

// ── Fetch + parse Google Sheet CSV ───────────────────────────────────────────

function map_plugin_get_sheet_data() {
    $cached = get_transient('map_plugin_sheet_data');
    if ($cached !== false) return $cached;

    $sheet_url = get_option('map_plugin_sheet_url', '');
    if (empty($sheet_url)) return array();

    // Extract sheet ID from full URL or use as-is
    if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $sheet_url, $matches)) {
        $sheet_id = $matches[1];
    } else {
        $sheet_id = trim($sheet_url);
    }

    $csv_url  = 'https://docs.google.com/spreadsheets/d/' . $sheet_id . '/export?format=csv';
    $response = wp_remote_get($csv_url, array('timeout' => 10));

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return array();
    }

    $body = wp_remote_retrieve_body($response);
    $rows = array_map('str_getcsv', explode("\n", trim($body)));
    $header = array_map('strtolower', array_map('trim', array_shift($rows)));

    $features = array();
    foreach ($rows as $row) {
        if (count($row) < 4) continue;
        $data = array_combine($header, array_map('trim', $row));

        $lat = isset($data['lat']) ? floatval($data['lat']) : 0;
        $lng = isset($data['lng']) ? floatval($data['lng']) : 0;
        if ($lat === 0.0 && $lng === 0.0) continue;

        $features[] = array(
            'name'  => isset($data['name'])  ? $data['name']          : '',
            'count' => isset($data['count']) ? intval($data['count'])  : 0,
            'lat'   => $lat,
            'lng'   => $lng,
        );
    }

    set_transient('map_plugin_sheet_data', $features, HOUR_IN_SECONDS);
    return $features;
}

// ── Fetch + parse specialists Google Sheet CSV ───────────────────────────────

function map_plugin_get_specialists_data() {
    $cached = get_transient('map_plugin_specialists_data');
    if ($cached !== false) return $cached;

    $sheet_url = get_option('map_plugin_specialists_sheet_url', '');
    if (empty($sheet_url)) return array();

    if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $sheet_url, $matches)) {
        $sheet_id = $matches[1];
    } else {
        $sheet_id = trim($sheet_url);
    }

    $csv_url  = 'https://docs.google.com/spreadsheets/d/' . $sheet_id . '/export?format=csv';
    $response = wp_remote_get($csv_url, array('timeout' => 10));

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return array();
    }

    $body   = wp_remote_retrieve_body($response);
    $rows   = array_map('str_getcsv', explode("\n", trim($body)));
    $header = array_map('strtolower', array_map('trim', array_shift($rows)));

    $specialists = array();
    foreach ($rows as $row) {
        if (count($row) !== count($header)) continue;
        $data = array_combine($header, array_map('trim', $row));

        $lat = isset($data['lat']) ? floatval($data['lat']) : 0;
        $lng = isset($data['lng']) ? floatval($data['lng']) : 0;
        if ($lat === 0.0 && $lng === 0.0) continue;

        $specialists[] = array(
            'institution' => isset($data['institution']) ? $data['institution'] : '',
            'specialist'  => isset($data['specialist'])  ? $data['specialist']  : '',
            'address'     => isset($data['address'])     ? $data['address']     : '',
            'phone'       => isset($data['phone'])       ? $data['phone']       : '',
            'lat'         => $lat,
            'lng'         => $lng,
        );
    }

    set_transient('map_plugin_specialists_data', $specialists, HOUR_IN_SECONDS);
    return $specialists;
}

// ── Admin settings page ───────────────────────────────────────────────────────

add_action('admin_menu', 'map_plugin_admin_menu');

function map_plugin_admin_menu() {
    add_options_page(
        'Map Plugin Settings',
        'Map Plugin',
        'manage_options',
        'map-plugin-settings',
        'map_plugin_settings_page'
    );
}

add_action('admin_init', 'map_plugin_register_settings');

function map_plugin_register_settings() {
    register_setting('map_plugin_options', 'map_plugin_sheet_url', array(
        'sanitize_callback' => 'sanitize_text_field',
    ));
    register_setting('map_plugin_options', 'map_plugin_specialists_sheet_url', array(
        'sanitize_callback' => 'sanitize_text_field',
    ));
}

function map_plugin_settings_page() {
    // Clear cache when form is saved
    if (isset($_GET['settings-updated'])) {
        delete_transient('map_plugin_sheet_data');
        delete_transient('map_plugin_specialists_data');
    }
    ?>
    <div class="wrap">
        <h1>Map Plugin Settings</h1>
        <p>Both sheets must be set to <strong>"Anyone with the link can view"</strong>.</p>

        <form method="post" action="options.php">
            <?php settings_fields('map_plugin_options'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="map_plugin_sheet_url">Patients Google Sheet URL</label></th>
                    <td>
                        <input
                            type="text"
                            id="map_plugin_sheet_url"
                            name="map_plugin_sheet_url"
                            value="<?php echo esc_attr(get_option('map_plugin_sheet_url', '')); ?>"
                            class="regular-text"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        <p class="description">Row 1 headers: <code>name, count, lat, lng</code></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="map_plugin_specialists_sheet_url">Specialists Google Sheet URL</label></th>
                    <td>
                        <input
                            type="text"
                            id="map_plugin_specialists_sheet_url"
                            name="map_plugin_specialists_sheet_url"
                            value="<?php echo esc_attr(get_option('map_plugin_specialists_sheet_url', '')); ?>"
                            class="regular-text"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        <p class="description">Row 1 headers: <code>institution, specialist, address, phone, lat, lng</code></p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save & Refresh Map Data'); ?>
        </form>
    </div>
    <?php
}
