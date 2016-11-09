'use strict';
import React from 'react'
import { render } from 'react-dom'
import Routes from './routes';
document.addEventListener('DOMContentLoaded', function onLoad() {
    render(Routes,document.getElementById('container'));
});