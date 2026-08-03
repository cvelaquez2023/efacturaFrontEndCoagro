/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-dupe-else-if */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-const */
import { OnInit } from '@angular/core';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { coerceStringArray } from '@angular/cdk/coercion';

const TREE_DATA: FoodNodeFlat[] = [
	{ name: 'Fruit', Id: 1, parentId: 0 },
	{ name: 'Apple', Id: 2, parentId: 1 },
	{ name: 'Banana', Id: 3, parentId: 1 },
	{ name: 'Fruit loops', Id: 4, parentId: 1 },
	{ name: 'Vegetables', Id: 5, parentId: 0 },
	{ name: 'Green', Id: 6, parentId: 5 },
	{ name: 'Broccoli', Id: 7, parentId: 6 },
	{ name: 'Brussels sprouts', Id: 8, parentId: 6 },
	{ name: 'Orange', Id: 9, parentId: 5 },
	{ name: 'Pumpkins', Id: 10, parentId: 9 },
	{ name: 'Carrots', Id: 11, parentId: 9 },
	{ name: 'India', Id: 12, parentId: 0 },
	{ name: 'Maharashtra', Id: 13, parentId: 12 },
	{ name: 'Mumbai', Id: 14, parentId: 13 },
	{ name: 'Karnataka', Id: 15, parentId: 12 },
	{ name: 'Bangalore', Id: 16, parentId: 15 }
];

interface FoodNodeFlat {
	Id: number;
	name: string;
	parentId: number;
	children?: FoodNodeFlat[];
}
interface FoodNode {
	name: string;
	children?: FoodNode[];
}

interface ExampleFlatNode {
	expandable: boolean;
	name: string;
	level: number;
}

@Component({
	selector: 'app-privilegios',
	templateUrl: './privilegios.component.html',
	styleUrls: ['./privilegios.component.scss']
})
export class PrivilegiosComponent implements OnInit {
	private _transformer = (node: FoodNode, level: number) => {
		return {
			expandable: !!node.children && node.children.length > 0,
			name: node.name,
			level: level
		};
	};
	treeControl = new FlatTreeControl<ExampleFlatNode>(
		(node) => node.level,
		(node) => node.expandable
	);
	treeFlattener = new MatTreeFlattener(
		this._transformer,
		(node) => node.level,
		(node) => node.expandable,
		(node) => node.children
	);
	dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
	constructor() {
		//this.dataSource.data = TREE_DATA;
	}
	hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
	ngOnInit(): void {
		this.dataSource.data = this.treeConstruct(TREE_DATA);
	}
	treeConstruct(treeData: FoodNodeFlat[]) {
		let constructedTree: FoodNodeFlat[] = [];

		for (let i of treeData) {
			let treeObj = i;
			let assigned = false;
			let core = 0 + 1;
			this.constructTree(constructedTree, treeObj, assigned, core);
		}

		return constructedTree;
	}

	constructTree(
		constructedTree: FoodNodeFlat[],
		treeObj: { Id: number; name: string; parentId: number; children?: FoodNodeFlat[] },
		assigned: boolean,
		core: number
	) {
		console.log('objetoArbol', treeObj);

		if (treeObj.parentId == 0) {
			treeObj.children = [];
			constructedTree.push(treeObj);
			return true;
		} else if (treeObj.parentId == constructedTree[core - 1].Id) {
			//console.log('entra ka comparacion', core - 1);
			treeObj.children = [];
			constructedTree[core - 1].children?.push(treeObj);
			//console.log('Push Children', constructedTree);
			return true;
		}
		return false;
	}

	/*
	constructTree(constructedTree: any[], treeObj: { parentId: null; children: never[] }, assigned: boolean) {
		if (treeObj.parentId == 0) {
			treeObj.children = [];
			constructedTree.push(treeObj);
			return true;
		} else if (treeObj.parentId == constructedTree.Id) {
			treeObj.children = [];
			constructedTree.children.push(treeObj);
			return true;
		} else {
			if (constructedTree.children != undefined) {
				for (let index = 0; index < constructedTree.children.length; index++) {
					let constructedObj = constructedTree.children[index];
					if (assigned == false) {
						assigned = this.constructTree(constructedObj, treeObj, assigned);
					}
				}
			} else {
				for (let index = 0; index < constructedTree.length; index++) {
					let constructedObj = constructedTree[index];
					if (assigned == false) {
						assigned = this.constructTree(constructedObj, treeObj, assigned);
					}
				}
			}
			return false;
		}
	}
	*/
}
function key(value: string, index: number, array: string[]): unknown {
	throw new Error('Function not implemented.');
}
