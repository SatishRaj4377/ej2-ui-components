import React, { useCallback, useMemo, useRef, useState } from "react";
import { DataManager } from "@syncfusion/ej2-data";
import {
  DataBinding,
  DiagramComponent,
  DiagramTools,
  HierarchicalTree,
  Inject,
  LayoutAnimation,
  MindMap,
  OverviewComponent,
  PrintAndExport,
  RadialTree,
  Rect,
  SnapConstraints,
} from "@syncfusion/ej2-react-diagrams";
import {
  ItemDirective,
  ItemsDirective,
  ToolbarComponent,
} from "@syncfusion/ej2-react-navigations";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import {
  AutoCompleteComponent,
  DropDownListComponent,
} from "@syncfusion/ej2-react-dropdowns";
import { DropDownButtonComponent } from "@syncfusion/ej2-react-splitbuttons";
import PageHeader from "../components/PageHeader";
import { MODULES } from "../components/modules";
import "../diagram-page.css";

const MODULE = MODULES.find((module) => module.key === "diagram")!;

type LayoutType =
  | "OrganizationalChart"
  | "HierarchicalTree"
  | "RadialTree"
  | "MindMap";

type InteractionMode = "Select" | "Pan";
type Orientation =
  | "TopToBottom"
  | "BottomToTop"
  | "LeftToRight"
  | "RightToLeft";
type Alignment = "Left" | "Center" | "Right" | "Top" | "Bottom";
type MindMapOrientation = "Horizontal" | "Vertical";
type NodeCategory = "Executive" | "Division" | "Team" | "Capability";

interface ProductNode {
  id: string;
  parentId?: string;
  name: string;
  description: string;
  category: NodeCategory;
  branch?: "Left" | "Right";
  parentName?: string;
}

interface SelectOption {
  text: string;
  value: string;
}

interface SubtreeOption extends SelectOption {
  orientation: "Vertical" | "Horizontal";
  type: "Alternate" | "Left" | "Right" | "Balanced" | "Center";
}

interface NodeTheme {
  fill: string;
  stroke: string;
  category: string;
  title: string;
  description: string;
}

const productHierarchy: ProductNode[] = [
  {
    id: "engineering",
    name: "Product Engineering",
    description: "Product strategy and technical direction",
    category: "Executive",
  },
  {
    id: "platform",
    parentId: "engineering",
    name: "Platform Engineering",
    description: "Shared infrastructure and developer services",
    category: "Division",
    branch: "Left",
  },
  {
    id: "experience",
    parentId: "engineering",
    name: "Product Experience",
    description: "Customer-facing digital experiences",
    category: "Division",
    branch: "Right",
  },
  {
    id: "operations",
    parentId: "engineering",
    name: "Engineering Operations",
    description: "Quality, security, and reliability",
    category: "Division",
    branch: "Right",
  },
  {
    id: "cloud-platform",
    parentId: "platform",
    name: "Cloud Platform",
    description: "Compute, network, and container services",
    category: "Team",
  },
  {
    id: "data-platform",
    parentId: "platform",
    name: "Data Platform",
    description: "Storage, analytics, and governance",
    category: "Team",
  },
  {
    id: "developer-platform",
    parentId: "platform",
    name: "Developer Platform",
    description: "SDKs, tools, and engineering productivity",
    category: "Team",
  },
  {
    id: "web-experience",
    parentId: "experience",
    name: "Web Experience",
    description: "Responsive browser-based products",
    category: "Team",
  },
  {
    id: "mobile-experience",
    parentId: "experience",
    name: "Mobile Experience",
    description: "Native mobile applications",
    category: "Team",
  },
  {
    id: "design-system",
    parentId: "experience",
    name: "Design System",
    description: "Components, themes, and accessibility",
    category: "Team",
  },
  {
    id: "quality-engineering",
    parentId: "operations",
    name: "Quality Engineering",
    description: "Automation and release quality",
    category: "Team",
  },
  {
    id: "security-engineering",
    parentId: "operations",
    name: "Security Engineering",
    description: "Application and platform protection",
    category: "Team",
  },
  {
    id: "site-reliability",
    parentId: "operations",
    name: "Site Reliability",
    description: "Availability and operational excellence",
    category: "Team",
  },
  {
    id: "container-services",
    parentId: "cloud-platform",
    name: "Container Services",
    description: "Runtime and orchestration",
    category: "Capability",
  },
  {
    id: "cloud-networking",
    parentId: "cloud-platform",
    name: "Cloud Networking",
    description: "Routing, traffic, and connectivity",
    category: "Capability",
  },
  {
    id: "identity-services",
    parentId: "cloud-platform",
    name: "Identity Services",
    description: "Authentication and authorization",
    category: "Capability",
  },
  {
    id: "analytics-services",
    parentId: "data-platform",
    name: "Analytics Services",
    description: "Reporting and business insights",
    category: "Capability",
  },
  {
    id: "data-governance",
    parentId: "data-platform",
    name: "Data Governance",
    description: "Catalog, quality, and compliance",
    category: "Capability",
  },
  {
    id: "stream-processing",
    parentId: "data-platform",
    name: "Stream Processing",
    description: "Real-time event processing",
    category: "Capability",
  },
  {
    id: "sdk-foundation",
    parentId: "developer-platform",
    name: "SDK Foundation",
    description: "Client libraries and integrations",
    category: "Capability",
  },
  {
    id: "developer-portal",
    parentId: "developer-platform",
    name: "Developer Portal",
    description: "API discovery and documentation",
    category: "Capability",
  },
  {
    id: "commerce-experience",
    parentId: "web-experience",
    name: "Commerce Experience",
    description: "Catalog and checkout journeys",
    category: "Capability",
  },
  {
    id: "account-experience",
    parentId: "web-experience",
    name: "Account Experience",
    description: "Profile and preference management",
    category: "Capability",
  },
  {
    id: "mobile-foundation",
    parentId: "mobile-experience",
    name: "Mobile Foundation",
    description: "Shared native capabilities",
    category: "Capability",
  },
  {
    id: "mobile-commerce",
    parentId: "mobile-experience",
    name: "Mobile Commerce",
    description: "Mobile purchasing experience",
    category: "Capability",
  },
  {
    id: "component-library",
    parentId: "design-system",
    name: "Component Library",
    description: "Reusable interface components",
    category: "Capability",
  },
  {
    id: "accessibility",
    parentId: "design-system",
    name: "Accessibility",
    description: "Inclusive product standards",
    category: "Capability",
  },
  {
    id: "test-automation",
    parentId: "quality-engineering",
    name: "Test Automation",
    description: "Continuous product validation",
    category: "Capability",
  },
  {
    id: "release-engineering",
    parentId: "quality-engineering",
    name: "Release Engineering",
    description: "Build and deployment pipelines",
    category: "Capability",
  },
  {
    id: "application-security",
    parentId: "security-engineering",
    name: "Application Security",
    description: "Secure development practices",
    category: "Capability",
  },
  {
    id: "cloud-security",
    parentId: "security-engineering",
    name: "Cloud Security",
    description: "Cloud posture and threat protection",
    category: "Capability",
  },
  {
    id: "observability",
    parentId: "site-reliability",
    name: "Observability",
    description: "Metrics, traces, and alerts",
    category: "Capability",
  },
  {
    id: "incident-management",
    parentId: "site-reliability",
    name: "Incident Management",
    description: "Response and service recovery",
    category: "Capability",
  },
];

const themes: Record<NodeCategory, NodeTheme> = {
  Executive: {
    fill: "#243B77",
    stroke: "#172554",
    category: "#D4DEFE",
    title: "#FFF",
    description: "#E1E8FF",
  },
  Division: {
    fill: "#E8EFFF",
    stroke: "#6484DF",
    category: "#315AC5",
    title: "#17336F",
    description: "#52678F",
  },
  Team: {
    fill: "#E9F8F2",
    stroke: "#55AF8C",
    category: "#0F805E",
    title: "#10533F",
    description: "#4D7366",
  },
  Capability: {
    fill: "#FFF5E4",
    stroke: "#DDA046",
    category: "#B8610B",
    title: "#713F12",
    description: "#8A653C",
  },
};
const orientationOptions: SelectOption[] = [
  { text: "Top to bottom", value: "TopToBottom" },
  { text: "Bottom to top", value: "BottomToTop" },
  { text: "Left to right", value: "LeftToRight" },
  { text: "Right to left", value: "RightToLeft" },
];
const horizontalOptions: SelectOption[] = ["Left", "Center", "Right"].map(
  (value) => ({
    text: value,
    value,
  }),
);
const verticalOptions: SelectOption[] = ["Top", "Center", "Bottom"].map(
  (value) => ({
    text: value,
    value,
  }),
);
const subtreeOptions: SubtreeOption[] = [
  {
    text: "Vertical alternate",
    value: "VerticalAlternate",
    orientation: "Vertical",
    type: "Alternate",
  },
  {
    text: "Vertical left",
    value: "VerticalLeft",
    orientation: "Vertical",
    type: "Left",
  },
  {
    text: "Vertical right",
    value: "VerticalRight",
    orientation: "Vertical",
    type: "Right",
  },
  {
    text: "Horizontal balanced",
    value: "HorizontalBalanced",
    orientation: "Horizontal",
    type: "Balanced",
  },
  {
    text: "Horizontal center",
    value: "HorizontalCenter",
    orientation: "Horizontal",
    type: "Center",
  },
  {
    text: "Horizontal left",
    value: "HorizontalLeft",
    orientation: "Horizontal",
    type: "Left",
  },
  {
    text: "Horizontal right",
    value: "HorizontalRight",
    orientation: "Horizontal",
    type: "Right",
  },
];
const mindMapOptions: SelectOption[] = [
  { text: "Horizontal", value: "Horizontal" },
  { text: "Vertical", value: "Vertical" },
];
const exportItems = [
  { text: "Export as PNG", id: "PNG", iconCss: "e-icons e-image" },
  { text: "Export as JPEG", id: "JPG", iconCss: "e-icons e-image" },
  { text: "Export as SVG", id: "SVG", iconCss: "e-icons e-file-new" },
];
const fields = { text: "text", value: "value" };
const connectorPropertiesFor = (layoutType: LayoutType) => ({
  type:
    layoutType === "MindMap"
      ? "Bezier"
      : layoutType === "RadialTree"
        ? "Straight"
        : "Orthogonal",
  cornerRadius:
    layoutType === "OrganizationalChart" || layoutType === "HierarchicalTree"
      ? 10
      : 0,
  style: {
    strokeColor: layoutType === "MindMap" ? "#667EB8" : "#8291AD",
    strokeWidth: layoutType === "MindMap" ? 2 : 1.7,
  },
  sourceDecorator: { shape: "None" },
  targetDecorator: {
    shape: ["MindMap", "RadialTree"].includes(layoutType) ? "None" : "Arrow",
    width: 8,
    height: 8,
    style: { fill: "#8291AD", strokeColor: "#8291AD" },
  },
});

export default function DiagramPage() {
  const diagramRef = useRef<any>(null),
    searchRef = useRef<any>(null);
  const dataManager = useMemo(() => new DataManager(productHierarchy), []);
  const searchData = useMemo(
    () =>
      productHierarchy.map((x) => ({
        ...x,
        parentName:
          productHierarchy.find((p) => p.id === x.parentId)?.name || "Root",
      })),
    [],
  );
  const [layoutType, setLayoutType] = useState<LayoutType>(
    "OrganizationalChart",
  );
  const [tool, setTool] = useState<InteractionMode>("Select");
  const [orientation, setOrientation] = useState<Orientation>("TopToBottom");
  const [horizontal, setHorizontal] = useState<Alignment>("Center");
  const [vertical, setVertical] = useState<Alignment>("Center");
  const [subtree, setSubtree] = useState("VerticalLeft");
  const [mindOrientation, setMindOrientation] =
    useState<MindMapOrientation>("Horizontal");
  const [showOverview, setShowOverview] = useState(true);
  const [diagramReady, setDiagramReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selected, setSelected] = useState<ProductNode>(productHierarchy[0]);

  const diagramId = "product-engineering-diagram";
  const overviewId = "product-engineering-overview";

  const subtreeSetting = useMemo(
    () => subtreeOptions.find((x) => x.value === subtree) || subtreeOptions[1],
    [subtree],
  );
  const orgInfo = useCallback(
    (node: any, options: any) => {
      if (!options.hasSubTree) {
        options.orientation = subtreeSetting.orientation;
        options.type = subtreeSetting.type;
      }
    },
    [subtreeSetting],
  );
  const layout = useMemo(() => {
    const common = {
      horizontalSpacing: 44,
      verticalSpacing: 64,
      enableAnimation: true,
      margin: { left: 45, right: 45, top: 45, bottom: 45 },
    };
    if (layoutType === "OrganizationalChart")
      return {
        ...common,
        type: layoutType,
        orientation,
        getLayoutInfo: orgInfo,
      };
    if (layoutType === "HierarchicalTree")
      return {
        ...common,
        type: layoutType,
        orientation,
        horizontalAlignment: horizontal,
        verticalAlignment: vertical,
        bounds: new Rect(30, 30, 1350, 720),
      };
    if (layoutType === "RadialTree")
      return {
        ...common,
        type: layoutType,
        root: "engineering",
        horizontalSpacing: 50,
        verticalSpacing: 50,
      };
    return {
      ...common,
      type: "MindMap",
      root: "engineering",
      orientation: mindOrientation,
      horizontalSpacing: 44,
      verticalSpacing: mindOrientation === "Vertical" ? 56 : 44,
      getBranch: (node: any) => {
        const data = node?.data;

        if (!data || data.id === "engineering") {
          return "Right";
        }

        let current = data;

        while (current?.parentId && current.parentId !== "engineering") {
          current = productHierarchy.find(
            (item) => item.id === current.parentId,
          );
        }

        return current?.branch === "Left" ? "Left" : "Right";
      },
    };
  }, [layoutType, orientation, horizontal, vertical, orgInfo, mindOrientation]);

  const fit = useCallback(
    () =>
      diagramRef.current?.fitToPage({
        region: "Content",
        mode: "Page",
        canZoomIn: true,
        canZoomOut: true,
        margin: { left: 45, right: 45, top: 45, bottom: 45 },
      }),
    [],
  );
  const relayout = useCallback(() => {
    const d = diagramRef.current;
    if (!d?.nodes?.length) return;
    d.layout = { ...layout };
    d.dataBind();
    d.doLayout();
    setTimeout(fit, 220);
  }, [layout, fit]);

  const nodeDefaults = useCallback(
    (node: any) => {
      const d = node.data || {},
        t = themes[d.category] || themes.Team,
        root = d.id === "engineering";
      if (layoutType === "RadialTree") {
        node.width = root ? 112 : d.category === "Division" ? 94 : 82;
        node.height = node.width;
        node.shape = { type: "Basic", shape: "Ellipse" };
        node.annotations = [
          {
            content: d.name || "",
            offset: { x: 0.5, y: 0.45 },
            margin: { left: 12, right: 12 },
            style: {
              color: t.title,
              fontSize: root ? 11 : 8.5,
              bold: true,
              textWrapping: "Wrap",
              textAlign: "Center",
            },
          },
          {
            content: (d.category || "").toUpperCase(),
            offset: { x: 0.5, y: 0.68 },
            style: { color: t.category, fontSize: 7.5, bold: true },
          },
        ];
      } else {
        const exec = d.category === "Executive",
          div = d.category === "Division",
          cap = d.category === "Capability";
        node.width =
          layoutType === "MindMap"
            ? root
              ? 220
              : 176
            : exec
              ? 232
              : div
                ? 210
                : cap
                  ? 186
                  : 200;
        node.height =
          layoutType === "MindMap"
            ? root
              ? 78
              : 62
            : exec
              ? 88
              : div
                ? 82
                : 76;
        node.shape = {
          type: "Basic",
          shape: "Rectangle",
          cornerRadius: root ? 16 : 12,
        };
        node.annotations = [
          {
            content: (d.category || "").toUpperCase(),
            offset: { x: 0.5, y: 0.2 },
            style: { color: t.category, fontSize: 9, bold: true },
          },
          {
            content: d.name || "",
            offset: { x: 0.5, y: 0.48 },
            margin: { left: 10, right: 10 },
            style: {
              color: t.title,
              fontSize: exec ? 15 : 13,
              bold: true,
              textWrapping: "Wrap",
              textOverflow: "Ellipsis",
            },
          },
          {
            content: d.description || "",
            offset: { x: 0.5, y: 0.75 },
            margin: { left: 10, right: 10 },
            style: {
              color: t.description,
              fontSize: 9.5,
              textWrapping: "Wrap",
              textOverflow: "Ellipsis",
            },
          },
        ];
      }
      node.style = {
        fill: t.fill,
        strokeColor: t.stroke,
        strokeWidth: root ? 2 : 1.5,
      };
      node.collapseIcon = {
        shape: "Minus",
        width: 20,
        height: 20,
        offset: { x: 0.5, y: 1 },
        fill: "#17336F",
        borderColor: "#FFF",
        borderWidth: 2,
        iconColor: "#FFF",
      };
      node.expandIcon = {
        shape: "Plus",
        width: 20,
        height: 20,
        offset: { x: 0.5, y: 1 },
        fill: "#FFF",
        borderColor: "#17336F",
        borderWidth: 2,
        iconColor: "#17336F",
      };
      return node;
    },
    [layoutType],
  );
  const connectorDefaults = useCallback(
    (c: any) => {
      Object.assign(c, connectorPropertiesFor(layoutType));
      return c;
    },
    [layoutType],
  );

  const details = useMemo(
    () => ({
      item: selected,
      parent: productHierarchy.find((x) => x.id === selected?.parentId),
      children: productHierarchy.filter((x) => x.parentId === selected?.id),
    }),
    [selected],
  );
  const reveal = useCallback(
    (itemData: ProductNode | string | null | undefined) => {
      const item =
        typeof itemData === "string"
          ? productHierarchy.find((entry) => entry.name === itemData)
          : productHierarchy.find(
              (entry) =>
                entry.id === itemData?.id || entry.name === itemData?.name,
            );

      const diagram = diagramRef.current;

      if (!diagram || !item) {
        return;
      }

      let parentId = item.parentId;

      while (parentId) {
        const parentNode = diagram.getObject(parentId);

        if (parentNode) {
          parentNode.isExpanded = true;
        }

        parentId = productHierarchy.find(
          (entry) => entry.id === parentId,
        )?.parentId;
      }

      diagram.dataBind();
      diagram.doLayout();

      window.setTimeout(() => {
        const node =
          diagram.getObject(item.id) ||
          diagram.nodes.find(
            (candidate: any) => candidate.data?.id === item.id,
          );

        if (!node) {
          return;
        }

        diagram.clearSelection();
        diagram.select([node]);

        if (node.wrapper?.bounds) {
          diagram.bringIntoView(node.wrapper.bounds);
        }

        setSelected(item);
        setPanelOpen(true);
        searchRef.current?.hidePopup();
      }, 180);
    },
    [],
  );

  const exportDiagram = (format: string) =>
    diagramRef.current?.exportDiagram({
      fileName: "product-engineering-structure",
      format,
      mode: "Download",
      region: "Content",
      margin: { left: 25, right: 25, top: 25, bottom: 25 },
    });
  const print = () =>
    diagramRef.current?.print({
      region: "Content",
      pageOrientation: "Landscape",
      stretch: "Meet",
      multiplePage: false,
    });
  const ddl = (
    data: SelectOption[],
    value: string,
    change: (value: any) => void,
  ) => (
    <DropDownListComponent
      dataSource={data}
      fields={fields}
      value={value}
      cssClass="diagram-property-dropdown"
      change={(e: any) => change(e.value)}
    />
  );

  const changeLayout = (nextLayout: LayoutType) => {
    if (nextLayout === layoutType) {
      return;
    }

    setLayoutType(nextLayout);
    window.requestAnimationFrame(() => {
      const diagram = diagramRef.current;

      if (!diagram) {
        return;
      }

      diagram.connectors.forEach((connector: any) => {
        const oldProperties = {
          type: connector.type,
          cornerRadius: connector.cornerRadius,
          style: connector.style,
          sourceDecorator: connector.sourceDecorator,
          targetDecorator: connector.targetDecorator,
        };
        const nextProperties = connectorPropertiesFor(nextLayout);

        Object.assign(connector, nextProperties);
        diagram.connectorPropertyChange(
          connector,
          oldProperties,
          nextProperties,
        );
      });

      fit();
    });
  };

  const tabs = () => (
    <div className="layout-tabs">
      {[
        ["OrganizationalChart", "Organizational"],
        ["HierarchicalTree", "Hierarchical"],
        ["RadialTree", "Radial"],
        ["MindMap", "Mind Map"],
      ].map(([v, l]) => (
        <ButtonComponent
          key={v}
          content={l}
          cssClass={
            layoutType === v ? "layout-tab layout-tab-active" : "layout-tab"
          }
          onClick={() => changeLayout(v as LayoutType)}
        />
      ))}
    </div>
  );
  const actions = () => (
    <div className="interaction-tools">
      <ButtonComponent
        cssClass={
          tool === "Select"
            ? "diagram-icon-button command-active"
            : "diagram-icon-button"
        }
        iconCss="e-icons e-mouse-pointer"
        onClick={() => setTool("Select")}
        title="Select"
      />
      <ButtonComponent
        cssClass={
          tool === "Pan"
            ? "diagram-icon-button command-active"
            : "diagram-icon-button"
        }
        iconCss="e-icons e-pan"
        onClick={() => setTool("Pan")}
        title="Pan"
      />
      <span className="command-separator" />
      <ButtonComponent
        cssClass="diagram-icon-button"
        iconCss="e-icons e-zoom-in"
        onClick={() =>
          diagramRef.current?.zoomTo({ type: "ZoomIn", zoomFactor: 0.2 })
        }
      />
      <ButtonComponent
        cssClass="diagram-icon-button"
        iconCss="e-icons e-zoom-out"
        onClick={() =>
          diagramRef.current?.zoomTo({ type: "ZoomOut", zoomFactor: 0.2 })
        }
      />
      <ButtonComponent
        cssClass="diagram-command-button"
        iconCss="e-icons e-zoom-to-fit"
        content="Fit"
        onClick={fit}
      />
      <ButtonComponent
        cssClass="diagram-command-button"
        iconCss="e-icons e-refresh"
        content="Re-layout"
        onClick={relayout}
      />
    </div>
  );
  const search = () => (
    <div className="diagram-search">
      <span
        className="e-icons e-search search-leading-icon"
        aria-hidden="true"
      />

      <AutoCompleteComponent
        ref={searchRef}
        dataSource={searchData}
        fields={{ value: "name" }}
        placeholder="Search nodes"
        filterType="Contains"
        allowCustom={false}
        highlight
        showClearButton
        suggestionCount={8}
        popupHeight="300px"
        popupWidth="310px"
        itemTemplate={(item: ProductNode) => (
          <div className="diagram-search-result">
            <strong>{item.name}</strong>
            <small>
              {item.category}
              {item.parentName !== "Root" ? ` · ${item.parentName}` : ""}
            </small>
          </div>
        )}
        select={(args) => reveal(args.itemData)}
      />
    </div>
  );

  const output = () => (
    <div className="output-tools">
      <DropDownButtonComponent
        cssClass="diagram-command-button"
        iconCss="e-icons e-export"
        content="Export"
        items={exportItems}
        select={(e: any) => exportDiagram(e.item.id)}
      />
      <ButtonComponent
        cssClass="diagram-command-button"
        iconCss="e-icons e-print"
        content="Print"
        onClick={print}
      />
    </div>
  );

  return (
    <div className="page">
      <PageHeader module={MODULE} />

      <div className="card diagram-showcase-card">
        <div className="diagram-page">
          <ToolbarComponent id="diagram-toolbar">
            <ItemsDirective>
              <ItemDirective template={tabs} />
              <ItemDirective type="Separator" />
              <ItemDirective template={actions} />
              <ItemDirective template={search} align="Right" />
              <ItemDirective type="Separator" align="Right" />
              <ItemDirective template={output} align="Right" />
            </ItemsDirective>
          </ToolbarComponent>
          <section className="diagram-workspace">
            <div className="diagram-canvas">
              <DiagramComponent
                id={diagramId}
                ref={diagramRef}
                width="100%"
                height="100%"
                dataSourceSettings={{
                  id: "id",
                  parentId: "parentId",
                  dataSource: dataManager,
                  root: "engineering",
                }}
                layout={layout}
                getNodeDefaults={nodeDefaults}
                getConnectorDefaults={connectorDefaults}
                tool={
                  tool === "Pan"
                    ? DiagramTools.ZoomPan
                    : DiagramTools.SingleSelect
                }
                snapSettings={{ constraints: SnapConstraints.None }}
                pageSettings={{
                  background: { color: "#FBFCFF" },
                  multiplePage: false,
                }}
                scrollSettings={{
                  scrollLimit: "Infinity",
                  canAutoScroll: true,
                }}
                click={(e: any) => {
                  const d = e?.element?.data;
                  if (d?.id)
                    setSelected(
                      productHierarchy.find((x) => x.id === d.id) || d,
                    );
                }}
                dataLoaded={() => {
                  window.requestAnimationFrame(() => {
                    const diagram = diagramRef.current;

                    if (!diagram) {
                      return;
                    }

                    diagram.doLayout();
                    fit();
                    setDiagramReady(true);
                  });
                }}
              >
                <Inject
                  services={[
                    DataBinding,
                    HierarchicalTree,
                    RadialTree,
                    MindMap,
                    LayoutAnimation,
                    PrintAndExport,
                  ]}
                />
              </DiagramComponent>
              {showOverview && diagramReady && (
                <aside className="overview-panel">
                  <div className="overview-header">
                    <strong>Overview</strong>
                    <span>Drag the viewport to navigate</span>
                  </div>
                  <OverviewComponent
                    id={overviewId}
                    sourceID={diagramId}
                    width="230px"
                    height="135px"
                  />
                </aside>
              )}
            </div>
            <ButtonComponent
              cssClass="property-edge-button"
              iconCss={
                panelOpen ? "e-icons e-chevron-right" : "e-icons e-chevron-left"
              }
              onClick={() => setPanelOpen((v) => !v)}
              title={panelOpen ? "Hide properties" : "Show properties"}
            />
            <aside
              className={
                panelOpen
                  ? "property-panel property-panel-open"
                  : "property-panel"
              }
            >
              <div className="property-header">
                <span className="e-icons e-settings" />
                <div>
                  <strong>Diagram properties</strong>
                  <small>Layout settings and selected node</small>
                </div>
              </div>
              <div className="property-content">
                <section className="property-block">
                  <h2>Navigator</h2>
                  <div className="property-action-row">
                    <div>
                      <strong>Overview</strong>
                      <span>Show the diagram navigator</span>
                    </div>
                    <ButtonComponent
                      cssClass={
                        showOverview
                          ? "overview-toggle overview-toggle-active"
                          : "overview-toggle"
                      }
                      iconCss={
                        showOverview ? "e-icons e-eye" : "e-icons e-eye-slash"
                      }
                      content={showOverview ? "On" : "Off"}
                      onClick={() => setShowOverview((v) => !v)}
                    />
                  </div>
                </section>
                {layoutType === "OrganizationalChart" && (
                  <section className="property-block">
                    <h2>Organizational layout</h2>
                    <div className="property-field">
                      <label>Orientation</label>
                      {ddl(orientationOptions, orientation, (value) => {
                        setOrientation(value as Orientation);
                        window.requestAnimationFrame(fit);
                      })}
                    </div>
                    <div className="property-field">
                      <label>Subtree alignment</label>
                      {ddl(subtreeOptions, subtree, setSubtree)}
                    </div>
                    <ButtonComponent
                      cssClass="apply-layout-button"
                      iconCss="e-icons e-refresh"
                      content="Apply layout"
                      onClick={relayout}
                    />
                  </section>
                )}
                {layoutType === "HierarchicalTree" && (
                  <section className="property-block">
                    <h2>Hierarchical layout</h2>
                    <div className="property-field">
                      <label>Orientation</label>
                      {ddl(orientationOptions, orientation, setOrientation)}
                    </div>
                    <div className="property-field">
                      <label>Horizontal alignment</label>
                      {ddl(horizontalOptions, horizontal, setHorizontal)}
                    </div>
                    <div className="property-field">
                      <label>Vertical alignment</label>
                      {ddl(verticalOptions, vertical, setVertical)}
                    </div>
                    <ButtonComponent
                      cssClass="apply-layout-button"
                      iconCss="e-icons e-refresh"
                      content="Apply layout"
                      onClick={relayout}
                    />
                  </section>
                )}
                {layoutType === "MindMap" && (
                  <section className="property-block">
                    <h2>Mind-map layout</h2>
                    <div className="property-field">
                      <label>Orientation</label>
                      {ddl(mindMapOptions, mindOrientation, (value) => {
                        setMindOrientation(value as MindMapOrientation);
                        window.requestAnimationFrame(fit);
                      })}
                    </div>
                    <ButtonComponent
                      cssClass="apply-layout-button"
                      iconCss="e-icons e-refresh"
                      content="Apply layout"
                      onClick={relayout}
                    />
                  </section>
                )}
                {details.item && (
                  <section className="property-block node-details">
                    <h2>Selected node</h2>
                    <div className="selected-node-heading">
                      <span>{details.item.category?.charAt(0)}</span>
                      <div>
                        <strong>{details.item.name}</strong>
                        <small>{details.item.category}</small>
                      </div>
                    </div>
                    <p>{details.item.description}</p>
                    <div className="node-relation">
                      <label>Parent</label>
                      {details.parent ? (
                        <button onClick={() => reveal(details.parent)}>
                          <span className="e-icons e-chevron-up" />
                          {details.parent.name}
                        </button>
                      ) : (
                        <span className="relation-empty">Root node</span>
                      )}
                    </div>
                    <div className="node-relation">
                      <label>Direct children ({details.children.length})</label>
                      {details.children.length ? (
                        <div className="child-list">
                          {details.children.map((c) => (
                            <button key={c.id} onClick={() => reveal(c)}>
                              <span className="e-icons e-chevron-right" />
                              {c.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="relation-empty">
                          No direct children
                        </span>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}
